import { useCallback, useEffect, useState } from "react";
import EditTag from "./EditTag";
import { Section } from "../../../shared/components/Section";
import { Svg } from "../../../shared/components/Svg";
import { IconButton } from "../../../shared/components/IconButton";
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
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

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

      {/* Add record: bottom-right floating button, in thumb reach. */}
      {viewMode === UserMode[0] && (
        <button
          type="button"
          aria-label="Add record"
          onClick={openCreateRecord}
          className="fixed z-40 right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] w-14 h-14 rounded-full bg-accent text-accent-fg shadow-lg shadow-black/50 flex items-center justify-center transition-transform active:scale-95"
        >
          <Svg type="plus" size="md" color="current" />
        </button>
      )}

      <div
        className={`fixed inset-x-0 top-0 z-10 flex items-center justify-between pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 pl-[calc(0.5rem+env(safe-area-inset-left))] pr-[calc(0.5rem+env(safe-area-inset-right))] transition-colors duration-300 funnel-display-font ${
          isScrolled ? "bg-canvas/90 backdrop-blur-md shadow-lg shadow-black/30" : ""
        }`}
      >
        <button
          type="button"
          aria-label="Edit vehicle details"
          onClick={openEditTag}
          className="z-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <img
            src={logmateLogo}
            alt=""
            className="h-12 bg-black/40 ring-1 ring-line rounded-full"
          />
        </button>
        <div className="flex items-center gap-2">
          <IconButton label="Menu" onClick={openMenu}>
            <span aria-hidden="true" className="flex flex-col items-center justify-center gap-1">
              <span className="block w-4 h-0.5 bg-current"></span>
              <span className="block w-4 h-0.5 bg-current"></span>
              <span className="block w-4 h-0.5 bg-current"></span>
            </span>
          </IconButton>
        </div>
      </div>
      <Section
        id={""}
        className="relative h-full azeret-mono-font text-fg overflow-hidden rounded-b-sheet bg-gradient-to-b from-surface via-surface/60 to-transparent"
      >
        

        {/* MOBILE START */}
        <div className="w-full mx-auto pt-16 my-4 px-2 tracking-tight text-center z-1 relative funnel-display-font">
            <div
              className={`text-left overflow-hidden transition-all duration-300 ease-in-out ${
                isScrolled ? "max-h-0 opacity-0" : "max-h-96 opacity-100 pt-6 pb-6"
              }`}
            >
              <h1 className="h-md:text-4xl h-sm:text-3xl text-2xl leading-none text-shadow font-semibold text-fg-soft whitespace-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-thumb]:rounded-full">
                {tag.Make}
              </h1>
              <h3 className="h-md:text-6xl h-sm:text-5xl text-4xl font-black leading-none text-shadow-white-lg whitespace-nowrap overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-thumb]:rounded-full">
                {tag.Model}
              </h3>
              <div className="flex items-center justify-between">
                <p className="h-md:text-4xl h-sm:text-3xl text-2xl leading-none text-shadow font-semibold text-fg-muted">{tag.Year}</p>
                <div className="flex items-center gap-2">
                  <IconButton label="Statistics" onClick={openStats}>
                    <Svg type="bars-1" size="md" color="current" />
                  </IconButton>
                  <IconButton label="Vehicle info" onClick={openInfo}>
                    <Svg type="info-1" size="lg" color="current" />
                  </IconButton>
                </div>
              </div>

            </div>


        </div>
        {/* MOBILE END */}
      </Section>
    </>
  );
}
