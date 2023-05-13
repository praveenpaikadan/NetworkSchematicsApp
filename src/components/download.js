import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Schematics() {
  const generatePDF = () => {
    // Get the HTML content you want to convert to PDF
    const htmlContent = document.getElementById('diagram');

    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Convert HTML content to image using html2canvas
    html2canvas(htmlContent).then(canvas => {
      // Add the image to the PDF document
      doc.addImage(canvas.toDataURL(), 'PNG', 15, 15, 1000, 700);
      // Save the PDF file
      doc.save('diagram.pdf');
    });
  };

  return (
    <div>
      <div id="diagram">Your diagram content goes here</div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
}

export default Schematics;