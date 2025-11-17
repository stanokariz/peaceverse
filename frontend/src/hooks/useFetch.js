import { useEffect, useState } from 'react'
import api from '../utils/api'

export const useFetch = (url) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(url)
                const d = res.data.data || res.data || []
                setData(Array.isArray(d) ? d : [])
            } catch (err) {
                console.error(err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [url])

    return { data, loading, error }
}
