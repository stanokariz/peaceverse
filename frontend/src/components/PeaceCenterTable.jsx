import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function PeaceCenterTable() {
    const [centers, setCenters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const toast = useToast()

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const res = await api.get('/peacecenters')
                const data = res.data.data || res.data || []
                setCenters(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error(err)
                setError('Failed to fetch peace centers')
                toast.error('Failed to fetch peace centers')
            } finally {
                setLoading(false)
            }
        }
        fetchCenters()
    }, [])

    const handleDelete = async (id) => {
        if (!confirm('Delete this peace center?')) return
        try {
            await api.delete(`/peacecenters/${id}`)
            setCenters(prev => prev.filter(c => c._id !== id))
            toast.success('Peace center deleted')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete peace center')
        }
    }

    if (loading) return <div className="p-6 text-gray-500">Loading peace centers...</div>
    if (error) return <div className="p-6 text-red-600">{error}</div>

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-x-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Peace Centers</h2>

            {centers.length === 0 ? (
                <div className="text-gray-500">No peace centers found.</div>
            ) : (
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {centers.map((center, i) => (
                            <tr key={center._id || i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="p-3">{i + 1}</td>
                                <td className="p-3 font-medium">{center.name}</td>
                                <td className="p-3">{center.location || 'N/A'}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(center._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </motion.div>
    )
}
