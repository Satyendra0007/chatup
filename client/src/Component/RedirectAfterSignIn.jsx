import { useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react'
import { useNavigate, useLocation } from 'react-router-dom';

export default function RedirectAfterSignIn() {
  const { isSignedIn } = useClerk();
  const Navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isSignedIn && location.pathname === "/") {
      Navigate('/conversation')
    }
  }, [isSignedIn, Navigate, location.pathname])
  return null;
}
