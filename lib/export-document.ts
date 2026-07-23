// Exportación de documentos (nota de venta / contrato) en el navegador.
// Usa html-to-image para rasterizar el nodo y jsPDF para exportar a Carta (Letter) / PNG.
// El nodo que se pasa siempre debe tener 794px de ancho (lo garantiza document-actions.tsx).

import { toPng } from 'html-to-image'

async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.addEventListener('click', (e) => e.stopPropagation())
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportNodeToImage(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await nodeToPng(node)
  triggerDownload(dataUrl, `${filename}.png`)
}

export async function exportNodeToPdf(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await nodeToPng(node)
  const { jsPDF } = await import('jspdf')

  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  // Documento tamaño Carta (215.9 mm x 279.4 mm)
  const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  const imgRatio = img.height / img.width
  let renderWidth = usableWidth
  let renderHeight = usableWidth * imgRatio

  if (renderHeight <= usableHeight) {
    const x = (pageWidth - renderWidth) / 2
    const y = margin
    pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight)
  } else {
    const scaleFactor = Math.min(usableWidth / img.width, usableHeight / img.height)
    renderWidth = img.width * scaleFactor
    renderHeight = img.height * scaleFactor
    const x = (pageWidth - renderWidth) / 2
    const y = (pageHeight - renderHeight) / 2
    pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight)
  }

  pdf.save(`${filename}.pdf`)
}
