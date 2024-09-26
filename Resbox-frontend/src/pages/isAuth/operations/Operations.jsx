import { useContext, useEffect, useMemo } from 'react'
import {
  subDays,
  isSameDay,
  isThisWeek,
  startOfWeek,
  addDays,
  startOfMonth
} from 'date-fns'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import useScrollToRef from '../../../hooks/useScrollToRef'
import { ReducersContext } from '../../../context/reducers/ReducersContext'
import { AuthContext } from '../../../context/auth/AuthContext'
import { ScrollRefContext } from '../../../context/scroll-ref/ScrollRefContext'
import OperationCard from '../../../components/operation-card/OperationCard'
import './Operations.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Operations = () => {
  const {
    statePartners: { operations }
  } = useContext(ReducersContext)
  const { sectionRefOperations } = useContext(ScrollRefContext)
  const useScroll = useScrollToRef()

  const { handleOperations } = useContext(AuthContext)

  useEffect(() => {
    setTimeout(() => {
      useScroll(sectionRefOperations)
    }, 1000)
    handleOperations(false)
  }, [])

  const sumByDate = (operations, filterFn) =>
    operations.filter(filterFn).reduce((acc, curr) => acc + curr.amount, 0)

  const today = new Date()
  const yesterday = subDays(today, 1)

  const salesToday = useMemo(
    () =>
      sumByDate(
        operations,
        (op) =>
          op.status === 'completed' && isSameDay(new Date(op.updatedAt), today)
      ),
    [operations]
  )
  const salesYesterday = useMemo(
    () =>
      sumByDate(
        operations,
        (op) =>
          op.status === 'completed' &&
          isSameDay(new Date(op.updatedAt), yesterday)
      ),
    [operations]
  )

  const salesThisWeek = useMemo(
    () =>
      sumByDate(
        operations,
        (op) => op.status === 'completed' && isThisWeek(new Date(op.updatedAt))
      ),
    [operations]
  )
  const salesThisMonth = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(today)
    return sumByDate(
      operations,
      (op) =>
        op.status === 'completed' &&
        new Date(op.updatedAt) >= startOfCurrentMonth
    )
  }, [operations])

  const operationsStatus = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(today)
    const confirmed = operations.filter(
      (op) =>
        op.status === 'completed' &&
        new Date(op.updatedAt) >= startOfCurrentMonth
    ).length
    const cancelled = operations.filter(
      (op) =>
        op.status === 'cancelled' &&
        new Date(op.updatedAt) >= startOfCurrentMonth
    ).length
    return { confirmed, cancelled }
  }, [operations])

  // Obtener las ventas diarias de la semana actual
  const dailySalesThisWeek = useMemo(() => {
    // Obtener el inicio de la semana (lunes)
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Lunes
    const daysInWeek = 7

    // Recorrer cada día de la semana (del lunes al domingo)
    const dailySales = Array.from({ length: daysInWeek }).map((_, i) => {
      const currentDay = addDays(startOfCurrentWeek, i)
      const sales = sumByDate(
        operations,
        (op) =>
          op.status === 'completed' &&
          isSameDay(new Date(op.updatedAt), currentDay)
      )
      return {
        date: currentDay,
        sales
      }
    })

    return dailySales
  }, [operations])

  // Obtener las ventas diarias de la semana actual
  const dailySalesCancelledThisWeek = useMemo(() => {
    // Obtener el inicio de la semana (lunes)
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Lunes
    const daysInWeek = 7

    // Recorrer cada día de la semana (del lunes al domingo)
    const dailySales = Array.from({ length: daysInWeek }).map((_, i) => {
      const currentDay = addDays(startOfCurrentWeek, i)
      const sales = sumByDate(
        operations,
        (op) =>
          op.status === 'cancelled' &&
          isSameDay(new Date(op.updatedAt), currentDay)
      )
      return {
        date: currentDay,
        sales
      }
    })

    return dailySales
  }, [operations])

  console.log(salesToday)
  console.log(salesYesterday)
  console.log(salesThisWeek)
  console.log(salesThisMonth)
  console.log(operationsStatus)
  console.log(dailySalesCancelledThisWeek)
  console.log(dailySalesThisWeek)

  const chartData = {
    labels: dailySalesThisWeek.map((day) => day.date.toLocaleDateString()),
    datasets: [
      {
        label: 'Venta del día',
        data: dailySalesThisWeek.map((day) => day.sales),
        backgroundColor: 'rgb(119, 223, 119)',
        borderColor: '#d2b48c',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      },
      {
        label: 'Venta canceladas del día',
        data: dailySalesCancelledThisWeek.map((day) => day.sales * -1),
        backgroundColor: '#ff5e5e',
        borderColor: '#ff5e5e',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Mis ventas de la semana'
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            let value = tooltipItem.raw
            if (value < 0) {
              return `Cancelaciones: €-${Math.abs(value)}`
            }
            return `Ventas: €${value}`
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value < 0 ? `€${value}` : `€${value}`
          }
        }
      }
    }
  }

  return (
    <div className='operations-component__container' ref={sectionRefOperations}>
      <div className='operations-component__title'>
        <h2>Mis operaciones</h2>
      </div>
      <Bar data={chartData} options={chartOptions} />

      <div className='operations-component__list-operations'>
        {operations
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10)
          .map((operation, index) => (
            <OperationCard key={index} operation={operation} />
          ))}
      </div>
    </div>
  )
}

export default Operations
