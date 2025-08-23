// hooks/useFinancialData.js
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const useFinancialData = (userId) => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const { data: incomeData } = await supabase
          .from("income")
          .select(`*, income_sources:source_id(name, color)`)
          .eq("user_uuid", userId)
          .order("date", { ascending: true });

        const { data: expenseData } = await supabase
          .from("spending")
          .select(`*, categories:category_id(name, color)`)
          .eq("user_uuid", userId)
          .order("date", { ascending: true });

        setIncome(incomeData || []);
        setExpenses(expenseData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { income, expenses, loading };
};

export default useFinancialData;