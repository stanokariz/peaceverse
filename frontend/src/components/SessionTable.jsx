import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function SessionTable() {
    const [sessions, setSessions] = useState([])
    const [filteredSessions, setFilteredSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const toast = useToast()

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get('/sessions')
                const data = res.data.data || res.data || []
                setSessions(Array.isArray(data) ? data : [])
                setFilteredSessions(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error(err)
                setError('Failed to fetch sessions')
                toast.error('Failed to fetch sessions')
            } finally {
                setLoading(false)
            }
        }
        fetchSessions()
    }, [])

    // 🔍 Filter sessions by location name
    useEffect(() => {
        if (!search) {
            setFilteredSessions(sessions)
        } else {
            const q = search.toLowerCase()
            const filtered = sessions.filter(
                s =>
                    (s.location && s.location.toLowerCase().includes(q)) ||
                    (s.phoneNumber && s.phoneNumber.includes(q))
            )
            setFilteredSessions(filtered)
        }
    }, [search, sessions])

    if (loading) return <div className="p-6 text-gray-500">Loading sessions...</div>
    if (error) return <div className="p-6 text-red-600">{error}</div>

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-x-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 md:mb-0">User Sessions</h2>

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search by location or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {filteredSessions.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No sessions found.</div>
            ) : (
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Phone Number</th>
                            <th className="p-3 text-left">Language</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-left">Peace Points</th>
                            <th className="p-3 text-left">Last Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSessions.map((session, i) => (
                            <tr
                                key={session._id || i}
                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                <td className="p-3">{i + 1}</td>
                                <td className="p-3 font-medium">{session.phoneNumber}</td>
                                <td className="p-3 capitalize">{session.language || '—'}</td>
                                <td className="p-3">{session.location || '—'}</td>
                                <td className="p-3">{session.peacePoints || 0}</td>
                                <td className="p-3">
                                    {session.updatedAt
                                        ? new Date(session.updatedAt).toLocaleString()
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </motion.div>
    )
}
