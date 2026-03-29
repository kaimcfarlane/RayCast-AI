from firebase_admin import auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer(auto_error=False)  # auto_error=False means it won't 401 if no token


def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[dict]:
    """
    Verify a Firebase ID token if provided.
    Returns decoded token dict, or None if no token was sent.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def get_user_id(token: Optional[dict]) -> str:
    """Extract user ID from token, or return 'guest' if no token."""
    if token is None:
        return "guest"
    return token.get("uid", "unknown")