import unittest
from datetime import date, time
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import BigInteger, create_engine, func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from sqlalchemy import event
from sqlalchemy.ext.compiler import compiles
from pydantic import ValidationError

from app.api.routes import appointments as appointment_routes
from app.core.database import Base
from app.models import (
    Appointment,
    AppointmentStatus,
    Doctor,
    Patient,
    PreVisitInformation,
    PreVisitSummary,
    User,
)
from app.schemas.pre_visit import PreVisitInformationRequest
from app.services.ai_service import AIService, AIServiceError, PreVisitAIResult


@compiles(BigInteger, "sqlite")
def compile_bigint_as_integer(_type, _compiler, **_kw):
    return "INTEGER"


class PreVisitWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.engine: Engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

        @event.listens_for(self.engine, "connect")
        def enable_foreign_keys(dbapi_connection, _connection_record):
            dbapi_connection.execute("PRAGMA foreign_keys=ON")

        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.patient_user = User(
            email="patient@example.test",
            password_hash="test-hash",
            role="PATIENT",
            is_active=True,
        )
        self.other_patient_user = User(
            email="other-patient@example.test",
            password_hash="test-hash",
            role="PATIENT",
            is_active=True,
        )
        self.doctor_user = User(
            email="doctor@example.test",
            password_hash="test-hash",
            role="DOCTOR",
            is_active=True,
        )
        self.other_doctor_user = User(
            email="other-doctor@example.test",
            password_hash="test-hash",
            role="DOCTOR",
            is_active=True,
        )
        self.patient = Patient(
            user=self.patient_user,
            first_name="Casey",
            last_name="Patient",
            date_of_birth=date(1990, 1, 1),
            phone="5550100",
        )
        self.other_patient = Patient(
            user=self.other_patient_user,
            first_name="Alex",
            last_name="Patient",
            date_of_birth=date(1992, 2, 2),
            phone="5550101",
        )
        self.doctor = Doctor(
            user=self.doctor_user,
            first_name="Jordan",
            last_name="Doctor",
            specialization="General Medicine",
            qualification="MD",
            experience_years=8,
            slot_duration_minutes=30,
        )
        self.other_doctor = Doctor(
            user=self.other_doctor_user,
            first_name="Morgan",
            last_name="Doctor",
            specialization="Cardiology",
            qualification="MD",
            experience_years=10,
            slot_duration_minutes=30,
        )
        self.appointment = Appointment(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=date(2027, 2, 3),
            start_time=time(10, 0),
            end_time=time(10, 30),
            status=AppointmentStatus.SCHEDULED,
        )
        self.other_appointment = Appointment(
            patient=self.other_patient,
            doctor=self.other_doctor,
            appointment_date=date(2027, 2, 4),
            start_time=time(11, 0),
            end_time=time(11, 30),
            status=AppointmentStatus.SCHEDULED,
        )
        self.info = PreVisitInformation(
            appointment=self.appointment,
            symptoms="A persistent headache and light sensitivity",
            additional_notes="Started yesterday",
        )
        self.db.add_all([
            self.patient_user,
            self.other_patient_user,
            self.doctor_user,
            self.other_doctor_user,
            self.patient,
            self.other_patient,
            self.doctor,
            self.other_doctor,
            self.appointment,
            self.other_appointment,
            self.info,
        ])
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    @staticmethod
    def valid_ai_result(**overrides):
        values = {
            "urgency_level": "MEDIUM",
            "chief_complaint": "Patient reports a headache with light sensitivity.",
            "suggested_questions": [
                "When did the headache begin?",
                "What makes it better or worse?",
                "Have you noticed any other symptoms?",
            ],
        }
        values.update(overrides)
        return PreVisitAIResult.model_validate(values)

    def test_successful_generation_and_repeat_updates_existing_summary(self):
        with patch.object(appointment_routes, "AIService") as service_class:
            service_class.return_value.generate_pre_visit_summary.return_value = self.valid_ai_result()
            first = appointment_routes.generate_my_pre_visit_summary(
                self.appointment.id, self.patient_user, self.db
            )
            first_id = first["id"]

            updated = self.valid_ai_result(
                urgency_level="LOW",
                chief_complaint="Patient reports improving headache symptoms.",
            )
            service_class.return_value.generate_pre_visit_summary.return_value = updated
            second = appointment_routes.generate_my_pre_visit_summary(
                self.appointment.id, self.patient_user, self.db
            )

        self.assertEqual(first_id, second["id"])
        self.assertEqual(second["urgency_level"], "LOW")
        self.assertEqual(
            self.db.scalar(select(func.count()).select_from(PreVisitSummary)),
            1,
        )

    def test_patient_cannot_generate_for_another_patients_appointment(self):
        with patch.object(appointment_routes, "AIService") as service_class:
            with self.assertRaises(HTTPException) as raised:
                appointment_routes.generate_my_pre_visit_summary(
                    self.appointment.id, self.other_patient_user, self.db
                )
        self.assertEqual(raised.exception.status_code, 404)
        service_class.assert_not_called()

    def test_saving_pre_visit_information_updates_the_existing_one(self):
        request = PreVisitInformationRequest.model_validate({
            "symptoms": "Intermittent stomach discomfort",
            "additional_notes": "More noticeable after meals",
        })
        first = appointment_routes.save_my_pre_visit_information(
            self.appointment.id, request, self.patient_user, self.db
        )
        second = appointment_routes.save_my_pre_visit_information(
            self.appointment.id, request, self.patient_user, self.db
        )
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(
            self.db.scalar(select(func.count()).select_from(PreVisitInformation)),
            1,
        )
        self.assertEqual(second["additional_notes"], "More noticeable after meals")

    def test_patient_can_create_pre_visit_information_for_their_appointment(self):
        self.db.delete(self.info)
        self.db.commit()
        self.assertIsNone(appointment_routes.get_my_pre_visit_information(
            self.appointment.id, self.patient_user, self.db
        ))
        request = PreVisitInformationRequest.model_validate({
            "symptoms": "Intermittent stomach discomfort",
            "additional_notes": "No other notes",
        })
        saved = appointment_routes.save_my_pre_visit_information(
            self.appointment.id, request, self.patient_user, self.db
        )
        self.assertEqual(saved["appointment_id"], self.appointment.id)
        self.assertEqual(saved["symptoms"], request.symptoms)

    def test_doctor_can_only_receive_their_own_appointment_summary(self):
        with patch.object(appointment_routes, "AIService") as service_class:
            service_class.return_value.generate_pre_visit_summary.return_value = self.valid_ai_result()
            appointment_routes.generate_my_pre_visit_summary(
                self.appointment.id, self.patient_user, self.db
            )

        own = appointment_routes.get_my_doctor_appointments(self.doctor_user, self.db)
        other = appointment_routes.get_my_doctor_appointments(self.other_doctor_user, self.db)
        self.assertEqual([row["id"] for row in own], [self.appointment.id])
        self.assertEqual(len(own[0]["pre_visit_information"]["summary"]["suggested_questions"]), 3)
        self.assertEqual([row["id"] for row in other], [self.other_appointment.id])
        self.assertIsNone(other[0]["pre_visit_information"])

    def test_missing_pre_visit_information_returns_clean_not_found(self):
        self.db.delete(self.info)
        self.db.commit()
        with self.assertRaises(HTTPException) as raised:
            appointment_routes.generate_my_pre_visit_summary(
                self.appointment.id, self.patient_user, self.db
            )
        self.assertEqual(raised.exception.status_code, 404)

    def test_insufficient_symptoms_are_rejected(self):
        with self.assertRaises(ValidationError):
            PreVisitInformationRequest.model_validate({"symptoms": "pain"})

        self.info.symptoms = "pain"
        self.db.commit()
        with self.assertRaises(HTTPException) as raised:
            appointment_routes.generate_my_pre_visit_summary(
                self.appointment.id, self.patient_user, self.db
            )
        self.assertEqual(raised.exception.status_code, 422)

    def test_gemini_failure_keeps_patient_information_and_creates_no_summary(self):
        with patch.object(appointment_routes, "AIService") as service_class:
            service_class.return_value.generate_pre_visit_summary.side_effect = AIServiceError("provider failed")
            with self.assertRaises(HTTPException) as raised:
                appointment_routes.generate_my_pre_visit_summary(
                    self.appointment.id, self.patient_user, self.db
                )

        self.assertEqual(raised.exception.status_code, 503)
        self.assertEqual(self.db.get(PreVisitInformation, self.info.id).symptoms, self.info.symptoms)
        self.assertEqual(self.db.scalar(select(func.count()).select_from(PreVisitSummary)), 0)

    def test_ai_service_validates_structured_output_and_hides_provider_error(self):
        valid_result = self.valid_ai_result()
        with (
            patch("app.services.ai_service.settings", SimpleNamespace(
                google_api_key="test-key", google_model="gemini-3.7-flash"
            )),
            patch("app.services.ai_service.ChatGoogleGenerativeAI") as llm_factory,
        ):
            structured = llm_factory.return_value.with_structured_output.return_value
            structured.invoke.return_value = valid_result.model_dump()
            result = AIService().generate_pre_visit_summary("Patient-reported symptoms")
            self.assertEqual(len(result.suggested_questions), 3)

            structured.invoke.return_value = {**valid_result.model_dump(), "suggested_questions": ["one", "two"]}
            with self.assertRaises(AIServiceError):
                AIService().generate_pre_visit_summary("Patient-reported symptoms")

            structured.invoke.side_effect = RuntimeError("sensitive provider detail")
            with self.assertRaises(AIServiceError) as raised:
                AIService().generate_pre_visit_summary("Patient-reported symptoms")
            self.assertNotIn("sensitive provider detail", str(raised.exception))


if __name__ == "__main__":
    unittest.main()
