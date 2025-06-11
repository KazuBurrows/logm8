import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "../styles/invoice-styles.scss";
// import logm8Logo from "../assets/logmate-logo.png";
// import logm8logo3 from "../assets/logm8logo3.png";
import { Svg } from "./Svg";

export interface MyPdfProps {
  serviceTag: ServiceTag;
  serviceRecords: ServiceRecord[];
}

export const MyPdf = ({ serviceTag, serviceRecords = [] }: MyPdfProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0); // Auto height
    pdf.save("invoice.pdf");
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short"
    });
  };

  return (
    <>
      <button onClick={generatePDF} className="bg-blue-500 text-white p-2 rounded flex mx-auto">
        Download PDF
      </button>
      <div ref={contentRef} className="w-[1080px] absolute ml-[-9999px]">
      <div className="card">
        <div className="card-body">
          <div id="invoice">
            <div className="invoice overflow-auto w-[1080px]">
              <div style={{ minWidth: "600px" }}>
                <header>
                  <div className="row w-[100px] mx-auto">
                    <img src="../assets/logmate-logo.png" />
                  </div>
                </header>
                <main>
                  <div className="row contacts">
                    <div className="col invoice-to">
                      <div className="text-3xl font-bold uppercase border-b-2 w-1/3 pb-4">
                        Vehicle Details
                      </div>
                      <div className="flex w-4/5 gap-36">
                        <div>
                          <h2 className="">Make: {serviceTag.Make ?? "N/A"}</h2>
                          <div className="">
                            Model: {serviceTag.Model ?? "N/A"}
                          </div>
                          <div className="">
                            Year: {serviceTag.Year ?? "N/A"}
                          </div>
                          <div className="">
                            Engine: {serviceTag.Engine ?? "N/A"}
                          </div>
                          <div className="">
                            Transmission: {serviceTag.Transmission ?? "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="">
                            Fuel: {serviceTag.Fuel ?? "N/A"}
                          </div>
                          <div className="">
                            Vehicle: {serviceTag.Vehicle ?? "N/A"}
                          </div>
                          <div className="">
                            Style: {serviceTag.Style ?? "N/A"}
                          </div>
                          <div className="">
                            Color: {serviceTag.Color ?? "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col invoice-details px-2">
                      <div className="text-xl font-semibold">
                        <span className="text-base font-normal">PDF downloaded on </span>{getCurrentDate()}
                      </div>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr className="bg-gray-100 text-lg">
                        <th className="p-2 pb-6 border border-slate-400">#</th>
                        <th className="p-2 pb-6 font-bold border border-slate-400 text-left">Serviced Date</th>
                        <th className="p-2 pb-6 font-bold border border-slate-400 text-left">Entered Date</th>
                        <th className="p-2 pb-6 font-bold border border-slate-400 text-left">Odometer</th>
                        <th className="p-2 pb-6 font-bold border border-slate-400 text-left">Serviced By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRecords.map((record, recordIndex) => (
                        <React.Fragment key={recordIndex}>
                          <tr className="border bordecr-slate-400">
                            <td className="pb-4 no text-center border border-slate-400">
                              {recordIndex + 1}
                            </td>
                            <td className="pb-4 pl-2 bg-slate-300 text-left border border-slate-400">
                              <h2 className="text-lg">{record.ServicedDate}</h2>
                            </td>
                            <td className="pb-4 pl-2 bg-slate-300 text-left border border-slate-400">
                              <h2 className="text-lg">{record.EnteredDate}</h2>
                            </td>
                            <td className="pb-4 text-lg pl-2 bg-slate-300 border border-slate-400 text-left">{record.Odometer}</td>
                            <td className="pb-4 text-lg pl-2 bg-slate-300 border border-slate-400 text-left">
                              {record.Certified}
                              {record.MechanicName}
                            </td>
                          </tr>
                          {record.CompletedTasks.map((task, taskIndex) => (
                            <tr
                              key={`${recordIndex}-${taskIndex}`}
                              className="border border-slate-400 bg-gray-100"
                            >
                              <td></td>
                              <td
                                className="pb-4 pl-16 text-left font-semibold border border-slate-400"
                              >
                                {task.Task}
                              </td>
                              <td colSpan={3} className="pb-4 px-2 border border-slate-400">
                                {task.Comment}
                              </td>
                              {/* <td colSpan={2} className="border border-slate-400">
                                {task.Receipts.map((receipt, receiptIndex) => (
                                  <li
                                    key={receiptIndex}
                                    className="flex px-2"
                                  >
                                    <a
                                      href={receipt}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-center text-sky-600 text-sm roboto-flex-font"
                                    >
                                      {receipt}
                                    </a>
                                  </li>
                                ))}
                              </td> */}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot></tfoot>
                  </table>

                  {/* <div className="notices">
                      <div>NOTICE:</div>
                      <div className="notice">
                        A finance charge of 1.5% will be made on unpaid balances
                        after 30 days.
                      </div>
                    </div> */}
                </main>
                <footer>
                  <h2 className="text-xl flex items-center justify-center gap-2 py-2">
                    Powered by{" "}
                    <img src="../assets/logm8logo3.png" className="w-[45px] py-2" alt="Logo" />
                  </h2>

                  <a
                    href="www.logm8.com"
                    target="_blank"
                    className="text-xl text-rose-500 underline"
                  >
                    www.logm8.com
                  </a>
                </footer>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
    
  );
};
