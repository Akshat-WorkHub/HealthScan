from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    UserRole,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)

def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Check whether the email is already registered
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    # Hash the password before storing it
    hashed_password = hash_password(user_data.password)

    # Create the user
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role.value,
        is_active=True,
    )

    # Save the user
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(user_data: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    # Do not reveal whether the email exists
    if not user or not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check whether the account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Create JWT
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )

@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
):
    return {
        "message": "You are authorized as ADMIN",
        "user_id": current_user.id,
        "role": current_user.role,
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user