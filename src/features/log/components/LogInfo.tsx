import { useEffect, useState } from "react";
import EditTag from "./EditTag";
import { Section } from "../../../shared/components/Section";
import { Button } from "../../../shared/components/Button";
import { Svg } from "../../../shared/components/Svg";
import { RecordModal } from "../../serviceRecord/components/RecordModal";
import { useLogData, UserMode } from "../context/LogDataContext";
import { StatsPanel } from "./StatsPanel";
import { TagInfoPanel } from "./TagInfoPanel";
import { NavMenuPanel } from "../../../shared/components/NavMenuPanel";
// const bg1 = require("../assets/bg-detail.svg");
const logmateLogo = require("../../../assets/logmate-logo.png");

export interface LogInfoProps {
  tag: ServiceTag;
  viewMode: string;
}

export default function LogInfo({ tag, viewMode }: LogInfoProps) {
  const { serviceOptions, ownershipOptions, addRecord, serviceRecords } = useLogData();

  const [editTagIsOpen, setEditTagIsOpen] = useState(false);
  const openEditTag = () => {
    setEditTagIsOpen(true);
  };
  const closeEditTag = () => {
    setEditTagIsOpen(false);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const openCreateRecord = () => {
    setIsCreateOpen(true);
  };
  const closeCreateRecord = () => {
    setIsCreateOpen(false);
  };

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const openStats = () => {
    setIsStatsOpen(true);
  };
  const closeStats = () => {
    setIsStatsOpen(false);
  };

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const openInfo = () => {
    setIsInfoOpen(true);
  };
  const closeInfo = () => {
    setIsInfoOpen(false);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openMenu = () => {
    setIsMenuOpen(true);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <EditTag
        isOpen={editTagIsOpen}
        onClose={closeEditTag}
        tag={tag}
      ></EditTag>
      <RecordModal
        mode="create"
        isOpen={isCreateOpen}
        onClose={closeCreateRecord}
        onInsert={addRecord}
        logServiceOptions={serviceOptions}
        logOwnershipOptions={ownershipOptions}
      ></RecordModal>
      <StatsPanel
        isOpen={isStatsOpen}
        onClose={closeStats}
        serviceRecords={serviceRecords}
      />
      <TagInfoPanel isOpen={isInfoOpen} onClose={closeInfo} tag={tag} />
      <NavMenuPanel isOpen={isMenuOpen} onClose={closeMenu} />

      <div
        className={`fixed inset-x-0 top-0 z-10 flex items-center justify-between px-2 py-2 transition-colors duration-300 funnel-display-font ${
          isScrolled ? "bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/30" : ""
        }`}
      >
        <img
          src={logmateLogo}
          alt="logm8-logo"
          className="h-12 z-20 bg-black/40 ring-1 ring-white/10 rounded-full"
          onClick={() => openEditTag()}
        ></img>
        <div className="flex items-center gap-2">
          {viewMode === UserMode[0] && (
          <Button
            type="button"
            size="xs"
            className="bg-blue-500 text-white w-9 h-9 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            onClick={() => openCreateRecord()}
          >
            <Svg type="add2" size="lg" color="white" />
          </Button>
          )}
          <Button
            type="button"
            size="xs"
            className="bg-white/10 border border-white/10 w-9 h-9 flex items-center justify-center"
            onClick={() => openMenu()}
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="block w-4 h-0.5 bg-white"></span>
              <span className="block w-4 h-0.5 bg-white"></span>
              <span className="block w-4 h-0.5 bg-white"></span>
            </div>
          </Button>
        </div>
      </div>
      <Section
        id={""}
        className="relative h-full azeret-mono-font text-white overflow-hidden rounded-b-3xl bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-transparent"
      >
        

        {/* MOBILE START */}
        <div className="w-full mx-auto pt-16 my-4 px-2 tracking-tight text-center z-1 relative funnel-display-font">
            <div
              className={`text-left overflow-hidden transition-all duration-300 ease-in-out ${
                isScrolled ? "max-h-0 opacity-0" : "max-h-96 opacity-100 pt-6 pb-6"
              }`}
            >
              <h1 className="h-md:text-4xl h-sm:text-3xl text-2xl leading-none text-shadow font-semibold text-white/70 whitespace-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-thumb]:rounded-full">
                {tag.Make}
              </h1>
              <h3 className="h-md:text-6xl h-sm:text-5xl text-4xl font-black leading-none text-shadow-white-lg whitespace-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-thumb]:rounded-full">
                {tag.Model}
              </h3>
              <div className="flex items-center justify-between">
                <p className="h-md:text-4xl h-sm:text-3xl text-2xl leading-none text-shadow font-semibold text-blue-400">{tag.Year}</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    className="bg-white/10 border border-white/10 text-white w-9 h-9 flex items-center justify-center"
                    onClick={() => openStats()}
                  >
                    <Svg type="bars-1" size="md" color="white" />
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    className="bg-white/10 border border-white/10 text-white w-9 h-9 flex items-center justify-center"
                    onClick={() => openInfo()}
                  >
                    <Svg type="info-1" size="lg" color="white" />
                  </Button>
                </div>
              </div>

            </div>


        </div>
        {/* MOBILE END */}
      </Section>
    </>
  );
}
