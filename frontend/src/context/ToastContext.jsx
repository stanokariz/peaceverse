import React, { createContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 space-y-2 z-50">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className={`rounded-lg px-4 py-2 shadow-md text-white ${t.type === 'success'
                                    ? 'bg-green-500'
                                    : t.type === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                }`}
                        >
                            {t.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
