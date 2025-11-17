import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function LocationTable() {
    const [locations, setLocations] = useState([])       // ✅ Always start with []
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const toast = useToast()

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true)
                const res = await api.get('/locations')
                // ✅ handle all possible backend response structures
                const data = res.data.data || res.data || []
                setLocations(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error(err)
                setError('Failed to fetch locations')
                toast.error('Failed to fetch locations')
            } finally {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [])

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return
        try {
            await api.delete(`/locations/${id}`)
            setLocations(prev => prev.filter(l => l._id !== id))
            toast.success('Location deleted')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete location')
        }
    }

    if (loading) return <div className="p-6 text-gray-500">Loading locations...</div>
    if (error) return <div className="p-6 text-red-600">{error}</div>

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-x-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Locations</h2>

            {locations.length === 0 ? (
                <div className="text-gray-500">No locations found.</div>
            ) : (
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Region</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(locations) && locations.map((loc, i) => (
                            <tr key={loc._id || i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="p-3">{i + 1}</td>
                                <td className="p-3 font-medium">{loc.name || '-'}</td>
                                <td className="p-3">{loc.region || 'N/A'}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(loc._id)}
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
