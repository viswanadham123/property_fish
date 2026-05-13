import { useEffect, type ReactNode } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { bootstrapAuth } from './authSlice'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    void dispatch(bootstrapAuth())
  }, [dispatch])
  return children
}
