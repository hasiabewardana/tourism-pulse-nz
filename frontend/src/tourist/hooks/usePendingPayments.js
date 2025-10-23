import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Hook to fetch the count of pending payments for a user
 * @returns {Object} - { count, loading, error, refresh }
 */
export const usePendingPayments = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchPendingPayments = async () => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/dest/api/v1/users/${userId}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const now = new Date();
      const pending = res.data.filter(
        (b) =>
          b.status === "pending" &&
          (!b.payment_status || b.payment_status === "unpaid") &&
          new Date(b.booking_date) > now
      );

      setCount(pending.length);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, [token, userId]);

  return {
    count,
    loading,
    error,
    refresh: fetchPendingPayments,
  };
};
