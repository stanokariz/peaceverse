import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

export function useToast() {
    const { addToast } = useContext(ToastContext)

    return {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    }
}
