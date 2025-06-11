import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import logm8Logo from "../assets/logmate-logo.png";
// import logm8logo3 from "../assets/logm8logo3.png";
interface PDFDownloadButtonProps {
  serviceTag: ServiceTag;
  serviceRecords: ServiceRecord[];
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ serviceTag, serviceRecords }) => {
  const generatePDF = async () => {
    // Create a temporary div (not added to the real DOM)
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px"; // Hide it off-screen

    // Inject the raw HTML content
    tempContainer.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="card-body">
            <div id="invoice">
              <div class="invoice">
                <header>
                  <div class="row w-[100px] mx-auto">
                    <img src="../assets/logmate-logo.png" />
                  </div>
                </header>
                <main>
                  <div class="row contacts">
                    <div class="col invoice-to">
                      <div class="text-3xl font-bold uppercase border-b-2 w-1/3 pb-4">Vehicle Details</div>
                      <div class="flex w-4/5 gap-36">
                        <div>
                          <h2>Make: ${serviceTag.Make ?? "N/A"}</h2>
                          <div>Model: ${serviceTag.Model ?? "N/A"}</div>
                          <div>Year: ${serviceTag.Year ?? "N/A"}</div>
                          <div>Engine: ${serviceTag.Engine ?? "N/A"}</div>
                          <div>Transmission: ${serviceTag.Transmission ?? "N/A"}</div>
                        </div>
                        <div>
                          <div>Fuel: ${serviceTag.Fuel ?? "N/A"}</div>
                          <div>Vehicle: ${serviceTag.Vehicle ?? "N/A"}</div>
                          <div>Style: ${serviceTag.Style ?? "N/A"}</div>
                          <div>Color: ${serviceTag.Color ?? "N/A"}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col invoice-details px-2">
                      <div class="text-xl font-semibold">
                        <span class="text-base font-normal">PDF downloaded on </span>${new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr class="bg-gray-100 text-lg">
                        <th class="p-2 pb-6 border border-slate-400">#</th>
                        <th class="p-2 pb-6 font-bold border border-slate-400 text-left">Serviced Date</th>
                        <th class="p-2 pb-6 font-bold border border-slate-400 text-left">Entered Date</th>
                        <th class="p-2 pb-6 font-bold border border-slate-400 text-left">Odometer</th>
                        <th class="p-2 pb-6 font-bold border border-slate-400 text-left">Serviced By</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${serviceRecords.map((record, recordIndex) => `
                        <tr class="border border-slate-400">
                          <td class="pb-4 text-center border border-slate-400">${recordIndex + 1}</td>
                          <td class="pb-4 pl-2 bg-slate-300 text-left border border-slate-400">${record.ServicedDate}</td>
                          <td class="pb-4 pl-2 bg-slate-300 text-left border border-slate-400">${record.EnteredDate}</td>
                          <td class="pb-4 text-lg pl-2 bg-slate-300 border border-slate-400 text-left">${record.Odometer}</td>
                          <td class="pb-4 text-lg pl-2 bg-slate-300 border border-slate-400 text-left">${record.Certified} ${record.MechanicName}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </main>
                <footer>
                  <h2 class="text-xl flex items-center justify-center gap-2 py-2">
                    Powered by <img src="../assets/logm8logo3.png" class="w-[45px] py-2" alt="Logo" />
                  </h2>
                  <a href="www.logm8.com" target="_blank" class="text-xl text-rose-500 underline">www.logm8.com</a>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append the temporary div to the document body
    document.body.appendChild(tempContainer);

    // Generate PDF
    const canvas = await html2canvas(tempContainer);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("invoice.pdf");

    // Clean up - remove the temporary div
    document.body.removeChild(tempContainer);
  };

  return (
    <button onClick={generatePDF} className="px-4 py-2 bg-blue-500 text-white rounded">
      Download PDF
    </button>
  );
};

export default PDFDownloadButton;
