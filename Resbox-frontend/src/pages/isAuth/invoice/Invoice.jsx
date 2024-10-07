import { useContext, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import useScrollToRef from '../../../hooks/useScrollToRef'
import { ReducersContext } from '../../../context/reducers/ReducersContext'
import { ScrollRefContext } from '../../../context/scroll-ref/ScrollRefContext'
import { Link, useNavigate } from 'react-router-dom'
import { formatCash } from '../operations/herlpers'
import { getDate } from '../../../helpers/date'
import './Invoice.css'
import logo from '/images/logo.png'

const Invoice = () => {
  const navigate = useNavigate()
  const {
    stateInvoices: { invoice },
    stateIsAuth: { user }
  } = useContext(ReducersContext)
  const { refInvoidSection, refInvoidPDF } = useContext(ScrollRefContext)
  const scrollToRef = useScrollToRef()

  useEffect(() => {
    scrollToRef(refInvoidSection)
  }, [])

  useEffect(() => {
    if (Object.keys(invoice).length <= 0) {
      navigate('../my-boxes')
    }
  }, [])

  const downloadPDF = () => {
    // Utiliza el ref directamente en lugar de un ID
    html2canvas(refInvoidPDF.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      const imgWidth = 190 // ancho del PDF
      const pageHeight = pdf.internal.pageSize.height
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Agregar la imagen al PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`factura_${invoice.invoice_number}.pdf`) // nombre del archivo PDF
    })
  }

  return (
    <section ref={refInvoidSection} className='invoice__content fadeIn'>
      <div ref={refInvoidPDF} className='invoice-container'>
        <div className='invoice-header'>
          <img src={logo} alt='logo res-box' width='50' />
          <p className='invoice-title'>RES-BOX</p>
          <p>NIF: X-123456789Y</p>
          <p>DIRECCIÓN: PASAJE LOS LUCERS 5, 3-A.</p>
          <p>CIUDAD - CODIGO POSTAL: ALICANTE, 03003.</p>
          <p>TLF: 91 111 11 11</p>
        </div>

        <div className='invoice-info'>
          <h3>FACTURA</h3>
          <p>FECHA: {getDate(invoice.createdAt)}</p>
          <p>Nº Factura: {invoice.invoice_number}</p>
        </div>

        <div className='invoice-client'>
          <h4>FACTURA A:</h4>
          <p>
            {user.name} {user.lastname}
          </p>
          <p>{user.email}</p>
        </div>

        <div className='invoice-table-container'>
          <table className='invoice-table'>
            <thead>
              <tr>
                <th>DESCRIPCIÓN</th>
                <th>CANTIDAD</th>
                <th>P/U</th>
                <th>SUB-TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.box?.map((box, index) => (
                <tr key={index}>
                  <td>{box.box.name_box}</td>
                  <td>{box.quantity}</td>
                  <td>{formatCash(box.box.price)}</td>
                  <td>{formatCash(box.box.price * box.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Total de la factura */}
        <div className='invoice-total'>
          <p>
            <strong>Total:</strong> {formatCash(invoice.amount)}
          </p>
        </div>

        {/* Estado de la factura */}
        <div className='invoice-status'>
          <p>
            <strong>Estado de la compra:</strong>
          </p>
          <p>{invoice.status}</p>
        </div>
      </div>
      <div className='invoice__btn-my-boxes'>
        <Link to={`../my-boxes`}>
          <button className='button yellow'>MIS BOXES</button>
        </Link>
        <button
          className='button'
          style={{ backgroundColor: 'var(--rb-bg-options)!important' }}
          onClick={downloadPDF}
        >
          Descargar Factura
        </button>
      </div>
    </section>
  )
}

export default Invoice