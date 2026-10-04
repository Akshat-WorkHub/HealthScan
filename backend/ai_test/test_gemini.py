import os
from typing import Literal

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field


load_dotenv()


class PreVisitAIResult(BaseModel):
    urgency_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(
        description="Preliminary urgency level of the patient's symptoms."
    )

    chief_complaint: str = Field(
        description="The patient's main reported complaint."
    )

    suggested_questions: list[str] = Field(
        min_length=3,
        max_length=3,
        description="Exactly three useful questions the patient can ask the doctor."
    )


api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise RuntimeError("GOOGLE_API_KEY is not set.")


llm = ChatGoogleGenerativeAI(
    model=os.getenv("GOOGLE_MODEL", "gemini-3.7-flash"),
    temperature=0,
    google_api_key=api_key,
)


structured_llm = llm.with_structured_output(PreVisitAIResult)


symptoms = """
I have had a sore throat and mild fever for two days.
I also have some difficulty swallowing and feel tired.
"""


prompt = f"""
You are an AI assistant inside a healthcare appointment management system.

Analyze the patient's reported symptoms and prepare a preliminary
pre-visit summary for the doctor.

Important safety requirements:
- This is NOT a medical diagnosis.
- Do not prescribe medication.
- Do not claim certainty about a disease.
- Assign only LOW, MEDIUM, or HIGH urgency.
- Identify the patient's main complaint.
- Provide exactly three useful questions the patient could ask the doctor.
- Base the response only on the information provided by the patient.

Patient symptoms:
{symptoms}
"""


result = structured_llm.invoke(prompt)


print("\n=== HealthScan AI Test ===")
print(f"Urgency: {result.urgency_level}")
print(f"Chief Complaint: {result.chief_complaint}")

print("Suggested Questions:")
for index, question in enumerate(result.suggested_questions, start=1):
    print(f"{index}. {question}")
