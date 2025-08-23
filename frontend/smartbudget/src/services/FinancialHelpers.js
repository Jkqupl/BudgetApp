// import { useMemo } from 'react';

// // Filter data based on time range
//   export const filteredData = useMemo(({timeRange,income,expenses}) => {
//     const now = new Date();
//     let startDate = new Date();

//     switch (timeRange) {
//       case '3months':
//         startDate.setMonth(now.getMonth() - 3);
//         break;
//       case '6months':
//         startDate.setMonth(now.getMonth() - 6);
//         break;
//       case 'year':
//         startDate.setFullYear(now.getFullYear() - 1);
//         break;
//       case 'all':
//         startDate = new Date('2020-01-01'); // Set to a very early date
//         break;
//     }

//     const filteredIncome = income.filter(item => new Date(item.date) >= startDate);
//     const filteredExpenses = expenses.filter(item => new Date(item.date) >= startDate);

//     return { income: filteredIncome, expenses: filteredExpenses };
//   }, [income, expenses, timeRange]);


//       // Group data by time period
//       export const chartData = useMemo(() => {
//         const { income: filteredIncome, expenses: filteredExpenses } = filteredData;
        
//         const groupData = (data, isIncome = true) => {
//           const grouped = {};
          
//           data.forEach(item => {
//             const date = new Date(item.date);
//             let key;
            
//             switch (groupBy) {
//               case 'week':
//                 // Get week starting Monday
//                 const dayOfWeek = date.getDay();
//                 const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
//                 const monday = new Date(date.setDate(diff));
//                 key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//                 break;
//               case 'month':
//                 key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
//                 break;
//               case 'quarter':
//                 const quarter = Math.floor(date.getMonth() / 3) + 1;
//                 key = `Q${quarter} ${date.getFullYear()}`;
//                 break;
//               default:
//                 key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
//             }
            
//             if (!grouped[key]) grouped[key] = 0;
//             grouped[key] += parseFloat(item.amount);
//           });
          
//           return grouped;
//         };
    
//         const incomeGrouped = groupData(filteredIncome, true);
//         const expenseGrouped = groupData(filteredExpenses, false);
        
//         // Get all unique time periods and sort them
//         const allPeriods = [...new Set([...Object.keys(incomeGrouped), ...Object.keys(expenseGrouped)])];
//         const sortedPeriods = allPeriods.sort((a, b) => {
//           // Simple date sorting - you might want to improve this based on your needs
//           return new Date(a) - new Date(b);
//         });
        
//         return sortedPeriods.map(period => ({
//           period,
//           income: incomeGrouped[period] || 0,
//           expenses: expenseGrouped[period] || 0,
//           net: (incomeGrouped[period] || 0) - (expenseGrouped[period] || 0)
//         }));
//       }, [filteredData, groupBy]);


//  // Calculate summary statistics
//   export const summaryStats = useMemo(() => {
//     const { income: filteredIncome, expenses: filteredExpenses } = filteredData;
    
//     const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
//     const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
//     const netIncome = totalIncome - totalExpenses;
//     const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

//     return {
//       totalIncome,
//       totalExpenses,
//       netIncome,
//       savingsRate
//     };
//   }, [filteredData]);