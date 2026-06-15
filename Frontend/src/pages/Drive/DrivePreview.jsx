import React, { useState, useEffect } from "react";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";
import Header from "../../components/Header";
import DateTime from "../../components/DateTime";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const InfoModal = ({ isOpen, title, message, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-indigo-300">
                {title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InstructionsModal = ({ isOpen, onClose, onConfirm, drive }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-[#0f1117]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >

            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin" data-lenis-prevent="true">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
                    Security & Environment Guidelines
                  </h3>
                  <p className="text-indigo-400 text-sm font-mono font-bold">
                    {drive?.hiringPositionName}
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-200 shadow-inner">
                  <p className="font-bold text-red-400 mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Strict AI Proctoring is Enabled
                  </p>
                  <p>
                    This assessment is monitored in real-time. Violating any of the
                    following rules multiple times will result in automatic termination of your
                    session.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">👤</span> Face Visibility
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">Your full face must remain in frame. Looking away repeatedly or wearing masks/face coverings is strictly prohibited.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">👥</span> Solo Environment
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">You must be completely alone. Detection of multiple faces in the camera frame will trigger an immediate violation.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">💡</span> Adequate Lighting
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">Ensure your room is well-lit. Environments that are too dark for the AI to properly track your face will cause termination.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">🎙️</span> Audio Monitoring
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">Continuous conversation, background speech, or suspicious audio frequency energy will be flagged by the microphone.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">📱</span> Device Restriction
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">Cell phones and other electronic devices are actively detected via AI object detection. Visible usage is prohibited.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <strong className="text-white flex items-center gap-2">
                      <span className="text-indigo-400 text-lg">🔒</span> Browser Security
                    </strong>
                    <p className="text-xs text-gray-400 leading-relaxed">Forced Full-Screen. Exiting full-screen, switching tabs, clicking outside, or using shortcuts (Copy/Paste, Alt+Tab, F12) are blocked.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 shrink-0 pt-4 border-t border-white/10">
              <button
                onClick={() => onConfirm(drive)}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                {drive?.driveType === "Interview"
                  ? "I Understand, Start Interview"
                  : "I Understand, Start Assessment"}
              </button>
              <button
                onClick={onClose}
                className="sm:w-1/3 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DrivePreview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  const [assignedDrives, setAssignedDrives] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState(Date.now());

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [instructionsModal, setInstructionsModal] = useState({
    isOpen: false,
    drive: null,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUserDrives = async (isInitialLoad = false) => {
      if (isInitialLoad) setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const drivesRes = await fetch(`${API_URL}/my-drives`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const resultRes = await fetch(
          `${API_URL}/interview/my-results`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const resultData = await resultRes.json();

        const drivesData = await drivesRes.json();

        const interviewRes = await fetch(
          `${API_URL}/drives/my-interviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const interviewData = await interviewRes.json();

        const assessmentDrives = drivesData.drives || [];

        const interviewDrives = (interviewData.interviews || []).map(
          (interview) => ({
            _id: interview._id,

            interviewId: interview._id,

            driveMongoId: interview.drive?._id,

            driveId: interview.drive?.driveId || "",

            hiringPositionName:
              interview.drive?.hiringPositionName || "Interview",

            driveType: "Interview",

            assessmentStartDate: interview.startDate,

            assessmentEndDate: interview.endDate,

            timeDurationInMin: interview.drive?.timeDurationInMin || 0,

            difficulty: interview.drive?.difficulty || "Intermediate",

            status: interview.status,

            isInterview: true,
          }),
        );

        setAssignedDrives([...assessmentDrives, ...interviewDrives]);

        setUserResults([
          ...(drivesData.results || []),
          ...(resultData.results || []),
        ]);
      } catch (error) {
        console.error("Failed to fetch drives:", error);
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    };

    fetchUserDrives(true);

    const pollInterval = setInterval(() => {
      fetchUserDrives(false);
    }, 500);

    return () => clearInterval(pollInterval);
  }, [user]);

  const openInfoModal = (title, message) => {
    setModalConfig({ isOpen: true, title, message });
  };

  const closeInfoModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const closeInstructionsModal = () => {
    setInstructionsModal({ isOpen: false, drive: null });
  };

  const confirmStartInterview = (drive) => {
    closeInstructionsModal();
    if (drive.driveType === "Interview") {
      navigate(`/interview/${drive.driveMongoId}`, { state: { drive } });
    } else {
      navigate("/assessment", { state: { drive } });
    }
  };

  const getDriveStatus = (drive) => {
    const now = currentTime;

    if (drive.driveType === "Interview") {
      const startTime = new Date(
        drive.assessmentStartDate || drive.startDate,
      ).getTime();

      const endTime = new Date(
        drive.assessmentEndDate || drive.endDate,
      ).getTime();

      const hasInterviewResult = userResults.find((r) => {
        const resultInterviewId = String(r.interviewId?._id || r.interviewId);

        const currentInterviewId = String(drive.interviewId);

        return resultInterviewId === currentInterviewId;
      });

      if (hasInterviewResult) {
        return {
          state: "completed",
          text: "View Result",
          resultId: hasInterviewResult._id,
        };
      }

      if (now < startTime) {
        return {
          state: "upcoming",
          text: "Start Interview",
        };
      }

      if (now >= startTime && now <= endTime) {
        return {
          state: "active",
          text: "Start Interview",
        };
      }

      return {
        state: "missed",
        text: "Interview Expired",
      };
    }


    const startTime = new Date(drive.assessmentStartDate).getTime();

    const durationMs = drive.timeDurationInMin * 60 * 1000;

    const endTime = startTime + durationMs;

    const hasResult = userResults.find(
      (r) => r.driveId && r.driveId._id === drive._id,
    );

    if (now < startTime) {
      return {
        state: "upcoming",
        text: "Start Assessment",
      };
    }

    if (now >= startTime && now <= endTime) {
      if (hasResult) {
        return {
          state: "completed",
          text: "View Result",
          resultId: hasResult._id,
        };
      }

      return {
        state: "active",
        text: "Start Assessment",
      };
    }

    if (hasResult) {
      return {
        state: "completed",
        text: "View Result",
        resultId: hasResult._id,
      };
    }

    return {
      state: "missed",
      text: "Not Attempted",
    };
  };

  const handleAction = (statusInfo, drive) => {
    if (statusInfo.state === "upcoming") {
      const isInterview = drive.driveType === "Interview";

      openInfoModal(
        isInterview ? "Interview Not Started" : "Assessment Not Started",

        `${
          isInterview ? "This interview" : "This assessment"
        } will be enabled at ${new Date(
          drive.assessmentStartDate || drive.startDate,
        ).toLocaleString()}. Please return at the scheduled time.`,
      );
    } else if (statusInfo.state === "active") {
      setInstructionsModal({ isOpen: true, drive });
    } else if (statusInfo.state === "missed") {
      const isInterview = drive.driveType === "Interview";

      openInfoModal(
        isInterview ? "Interview Not Attempted" : "Assessment Not Attempted",

        `${
          isInterview
            ? "You did not attempt this interview."
            : "You did not attempt this assessment."
        } The scheduled time window has passed.`,
      );
    } else if (statusInfo.state === "completed") {
      const type = drive.driveType === "Interview" ? "interview" : "assessment";

      const id = drive.driveMongoId || drive._id;

      navigate(`/drive/result/${id}/${type}`);
    }
  };

  return (
    <>
      <SoftBackdrop />
      <LenisScroll />
      <Header />

      <InfoModal {...modalConfig} onClose={closeInfoModal} />

      <InstructionsModal
        isOpen={instructionsModal.isOpen}
        drive={instructionsModal.drive}
        onClose={closeInstructionsModal}
        onConfirm={confirmStartInterview}
      />

      <motion.div
        className="p-6 max-w-5xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <DateTime />

        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
          Welcome, {fullName}
        </h1>

        <div className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-widest">
          Drives
        </div>

        {loading ? (
          <div className="text-indigo-400 animate-pulse text-center py-10 font-bold">
            Loading your drives...
          </div>
        ) : assignedDrives.length === 0 ? (
          <div className="text-gray-400 text-center py-10 border border-white/10 rounded-2xl bg-white/5">
            You currently have no drives.
          </div>
        ) : (
          <div className="space-y-4">
            {assignedDrives.map((drive, index) => {
              if (!drive) return null;

              const statusInfo = getDriveStatus(drive);

              let btnClass =
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all ";
              if (statusInfo.state === "upcoming") {
                btnClass +=
                  "bg-gray-600/50 text-gray-400 cursor-pointer hover:bg-gray-600/70 border border-gray-500/30";
              } else if (statusInfo.state === "active") {
                btnClass +=
                  "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]";
              } else if (statusInfo.state === "missed") {
                btnClass +=
                  "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer";
              } else if (statusInfo.state === "completed") {
                btnClass +=
                  "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30";
              }

              return (
                <motion.div
                  key={drive._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <div className="flex-1">
                    <div className="text-xs text-indigo-400 font-mono font-bold mb-2">
                      ID: {drive.driveId}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {drive.hiringPositionName}
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                      <span className="flex items-center gap-1.5">
                        {new Date(
                          drive.assessmentStartDate || drive.startDate,
                        ).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        ⏱ {drive.timeDurationInMin} mins
                      </span>
                      <span className="flex items-center gap-1.5 uppercase text-xs font-bold text-indigo-300">
                        <span>{drive.driveType}</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex justify-end">
                    <button
                      onClick={() => handleAction(statusInfo, drive)}
                      className={btnClass}
                    >
                      {statusInfo.text}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default DrivePreview;
