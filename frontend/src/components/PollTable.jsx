import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function PollTable() {
    const [polls, setPolls] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const toast = useToast()

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const res = await api.get('/polls')
                const data = res.data.data || res.data || []
                setPolls(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error(err)
                setError('Failed to fetch polls')
                toast.error('Failed to fetch polls')
            } finally {
                setLoading(false)
            }
        }
        fetchPolls()
    }, [])

    const handleDelete = async (id) => {
        if (!confirm('Delete this poll?')) return
        try {
            await api.delete(`/polls/${id}`)
            setPolls(prev => prev.filter(p => p._id !== id))
            toast.success('Poll deleted')
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete poll')
        }
    }

    if (loading) return <div className="p-6 text-gray-500">Loading polls...</div>
    if (error) return <div className="p-6 text-red-600">{error}</div>

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-x-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Polls</h2>

            {polls.length === 0 ? (
                <div className="text-gray-500">No polls found.</div>
            ) : (
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Poll</th>
                            <th className="p-3 text-left">Created</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {polls.map((poll, i) => (
                            <tr key={poll._id || i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="p-3">{i + 1}</td>
                                <td className="p-3 font-medium">{poll.poll}</td>
                                <td className="p-3">{new Date(poll.createdAt).toLocaleString()}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(poll._id)}
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
