import { Bell, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationToast({ message, onClose }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    className="fixed top-20 right-5 z-50 bg-white/95 backdrop-blur-md border-l-4 border-amber-500 shadow-2xl rounded-2xl p-4 max-w-sm border border-slate-200"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                                    Queue Alert
                                </h4>
                                <p className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                                    {message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
