import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SOS_VIBRATION_PATTERN, 
  SOS_PATTERN_DURATION,
  CONTINUOUS_VIBRATION_PATTERN,
  CONTINUOUS_PATTERN_DURATION,
  VibrationPattern
} from './constants';
import SettingsModal from './SettingsModal';

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.74a3 3 0 0 1-2.598 4.502H4.644a3 3 0 0 1-2.598-4.502L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.337 6.337 0 0 1-.22.127c-.331.183-.581.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.337 6.337 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
    </svg>
);

interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
}

const BatteryIcon: React.FC<{ level: number; charging: boolean; className?: string }> = ({ level, charging, className }) => {
  const percentage = Math.round(level * 100);
  const barColorClass = percentage > 20 ? (percentage > 50 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500';

  return (
    <div className={`flex items-center gap-2 font-semibold ${className}`}>
      {charging && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 0L3 11h5v9l8-11h-5V0z" />
        </svg>
      )}
      <div className="relative w-8 h-4 border-2 border-current rounded flex items-center p-px">
        <div className={`h-full rounded-sm ${barColorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="font-mono text-sm">{percentage}%</span>
    </div>
  );
};

interface Location {
  latitude: number;
  longitude: number;
}

interface StatusInfo {
    message: string;
    location: Location | null;
    battery: { level: number; charging: boolean } | null;
}

const StatusViewer: React.FC<{ info: StatusInfo }> = ({ info }) => {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl p-6 md:p-8 border border-red-500/50">
                <div className="flex items-center gap-4 mb-6">
                    <WarningIcon className="h-10 w-10 text-red-500 flex-shrink-0" />
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Emergency Alert Status</h1>
                </div>
                
                <div className="space-y-5">
                    <div>
                        <h2 className="font-semibold text-red-400 uppercase tracking-wider text-sm mb-1">Message</h2>
                        <p className="text-lg bg-gray-700/50 p-3 rounded-md break-words">{info.message || 'No message provided.'}</p>
                    </div>

                    <div>
                        <h2 className="font-semibold text-red-400 uppercase tracking-wider text-sm mb-1">Last Known Location</h2>
                        {info.location ? (
                            <div className="bg-gray-700/50 p-3 rounded-md">
                                <p className="font-mono text-lg">{`${info.location.latitude.toFixed(6)}, ${info.location.longitude.toFixed(6)}`}</p>
                                <a 
                                    href={`https://www.google.com/maps?q=${info.location.latitude},${info.location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 hover:underline mt-1 inline-block"
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        ) : <p className="text-gray-400 italic bg-gray-700/50 p-3 rounded-md">Location not available.</p>}
                    </div>
                    
                    <div>
                        <h2 className="font-semibold text-red-400 uppercase tracking-wider text-sm mb-1">Device Battery</h2>
                        {info.battery ? (
                             <div className="bg-gray-700/50 p-3 rounded-md flex items-center">
                                <BatteryIcon level={info.battery.level} charging={info.battery.charging} className="text-white" />
                             </div>
                        ) : <p className="text-gray-400 italic bg-gray-700/50 p-3 rounded-md">Battery status not available.</p>}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-6 text-center">This is a status page generated by the Distress Signal app.</p>
            </div>
        </main>
    );
};

const App: React.FC = () => {
  const [isSignalActive, setIsSignalActive] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState<string>('This is an emergency. Please help.');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState<boolean>(false);
  const [vibrationPattern, setVibrationPattern] = useState<VibrationPattern>('SOS');
  const [textColor, setTextColor] = useState<string>('white');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [batteryStatus, setBatteryStatus] = useState<{level: number, charging: boolean} | null>(null);
  const [viewMode, setViewMode] = useState<'app' | 'status'>('app');
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);
  const vibrationIntervalRef = useRef<number | null>(null);
  const locationWatcherId = useRef<number | null>(null);

  useEffect(() => {
    // Check for status view mode from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'status') {
      const info: StatusInfo = {
        message: params.get('msg') || '',
        location: params.has('lat') && params.has('lon') ? {
          latitude: parseFloat(params.get('lat')!),
          longitude: parseFloat(params.get('lon')!),
        } : null,
        battery: params.has('bat') && params.has('chg') ? {
          level: parseFloat(params.get('bat')!),
          charging: params.get('chg') === '1',
        } : null,
      };
      setStatusInfo(info);
      setViewMode('status');
      return; // Skip other setup
    }

    try {
      const savedMessage = localStorage.getItem('distressMessage');
      const savedContacts = localStorage.getItem('distressContacts');
      const savedSilentMode = localStorage.getItem('distressSilentMode');
      const savedVibrationPattern = localStorage.getItem('distressVibrationPattern');
      const savedTextColor = localStorage.getItem('distressTextColor');
      
      if (savedMessage) setCustomMessage(savedMessage);
      if (savedContacts) setEmergencyContacts(JSON.parse(savedContacts));
      if (savedSilentMode) setIsSilentMode(JSON.parse(savedSilentMode));
      if (savedVibrationPattern) setVibrationPattern(JSON.parse(savedVibrationPattern));
      if (savedTextColor) setTextColor(JSON.parse(savedTextColor));

    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'status') return;

    let batteryManager: BatteryManager | null = null;
    const updateBatteryStatus = () => {
        if (batteryManager) {
            setBatteryStatus({
                level: batteryManager.level,
                charging: batteryManager.charging,
            });
        }
    };

    if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((bm: BatteryManager) => {
            batteryManager = bm;
            updateBatteryStatus();
            bm.addEventListener('levelchange', updateBatteryStatus);
            bm.addEventListener('chargingchange', updateBatteryStatus);
        });
    }

    return () => {
        if (batteryManager) {
            batteryManager.removeEventListener('levelchange', updateBatteryStatus);
            batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
        }
    };
}, [viewMode]);

  const handleSaveSettings = (message: string, contacts: string[], isSilent: boolean, pattern: VibrationPattern, newTextColor: string) => {
    setCustomMessage(message);
    setEmergencyContacts(contacts);
    setIsSilentMode(isSilent);
    setVibrationPattern(pattern);
    setTextColor(newTextColor);
    try {
      localStorage.setItem('distressMessage', message);
      localStorage.setItem('distressContacts', JSON.stringify(contacts));
      localStorage.setItem('distressSilentMode', JSON.stringify(isSilent));
      localStorage.setItem('distressVibrationPattern', JSON.stringify(pattern));
      localStorage.setItem('distressTextColor', JSON.stringify(newTextColor));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  const stopLocationTracking = useCallback(() => {
    if (locationWatcherId.current !== null) {
      navigator.geolocation.clearWatch(locationWatcherId.current);
      locationWatcherId.current = null;
    }
  }, []);

  const stopSignal = useCallback(() => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    if (oscillatorRef.current) oscillatorRef.current.stop();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    
    sirenIntervalRef.current = null;
    oscillatorRef.current = null;
    gainRef.current = null;
    audioContextRef.current = null;

    if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
    vibrationIntervalRef.current = null;
    if (navigator.vibrate) navigator.vibrate(0);
    stopLocationTracking();
  }, [stopLocationTracking]);

  const startSignal = useCallback(() => {
    if (!isSilentMode) {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            const oscillator = context.createOscillator();
            oscillatorRef.current = oscillator;
            const gain = context.createGain();
            gainRef.current = gain;
            oscillator.type = 'sine';
            oscillator.connect(gain);
            gain.connect(context.destination);
            gain.gain.setValueAtTime(0.5, context.currentTime);
            let freqToggle = true;
            oscillator.frequency.setValueAtTime(800, context.currentTime);
            oscillator.start();
            sirenIntervalRef.current = window.setInterval(() => {
              if(oscillatorRef.current && audioContextRef.current) {
                const nextFreq = freqToggle ? 600 : 800;
                oscillatorRef.current.frequency.linearRampToValueAtTime(nextFreq, audioContextRef.current.currentTime + 0.1);
                freqToggle = !freqToggle;
              }
            }, 400);
        } catch (error) { console.error("Could not start audio:", error); }
    }

    if (navigator.vibrate) {
        const pattern = vibrationPattern === 'SOS' ? SOS_VIBRATION_PATTERN : CONTINUOUS_VIBRATION_PATTERN;
        const duration = vibrationPattern === 'SOS' ? SOS_PATTERN_DURATION : CONTINUOUS_PATTERN_DURATION;
        const vibrate = () => navigator.vibrate(pattern);
        vibrate();
        vibrationIntervalRef.current = window.setInterval(vibrate, duration);
    }

    setLocation(null);
    setLocationError(null);
    if (navigator.geolocation) {
      locationWatcherId.current = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(`Location Error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, [isSilentMode, vibrationPattern]);

  useEffect(() => {
    if (viewMode === 'status') return;

    if (isSignalActive) {
      startSignal();
    } else {
      stopSignal();
    }
    return () => stopSignal();
  }, [isSignalActive, startSignal, stopSignal, viewMode]);

  const handleActivationRequest = () => {
    if (isSignalActive) {
      setIsSignalActive(false);
    } else {
      setShowConfirmation(true);
    }
  };

  const confirmActivation = (activate: boolean) => {
    setShowConfirmation(false);
    if (activate) {
      setIsSignalActive(true);
    }
  };

  const handleSendAlert = () => {
    if (emergencyContacts.length === 0) {
      alert("No emergency contacts configured. Please add contacts in settings.");
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('view', 'status');
    params.set('msg', customMessage);
    if (location) {
        params.set('lat', location.latitude.toString());
        params.set('lon', location.longitude.toString());
    }
    if (batteryStatus) {
        params.set('bat', batteryStatus.level.toString());
        params.set('chg', batteryStatus.charging ? '1' : '0');
    }

    const statusUrl = `${baseUrl}?${params.toString()}`;

    const messageBody = `EMERGENCY from a contact. View my live status and location here: ${statusUrl}`;
    
    const contactsString = emergencyContacts.join(',');
    const smsUrl = `sms:${contactsString}?body=${encodeURIComponent(messageBody)}`;
    window.location.href = smsUrl;
  };

  const handleShareApp = async () => {
    const shareData = {
        title: 'Distress Signal App',
        text: 'Check out this emergency distress signal web app.',
        url: window.location.origin,
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error("Error sharing:", err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert("App link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
            alert("Could not copy link to clipboard.");
        }
    }
  };

  if (viewMode === 'status' && statusInfo) {
    return <StatusViewer info={statusInfo} />;
  }

  const containerClasses = isSignalActive ? 'flashing-bg' : 'bg-gray-900 text-gray-200';
  const buttonClasses = isSignalActive ? 'bg-white text-red-700 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700';
  const textColorClass = textColor === 'black' ? 'text-black' : textColor === 'yellow' ? 'text-yellow-300' : 'text-white';

  return (
    <>
      <main className={`flex flex-col items-center justify-center min-h-screen w-full transition-colors duration-200 ${containerClasses}`}>
        {!isSignalActive && (
          <>
            <div className="absolute top-4 left-4 z-10">
              {batteryStatus && <BatteryIcon level={batteryStatus.level} charging={batteryStatus.charging} className="text-gray-400" />}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button onClick={handleShareApp} className="text-gray-400 hover:text-white transition p-2" aria-label="Share App">
                  <ShareIcon className="h-7 w-7" />
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white transition p-2" aria-label="Open Settings">
                <GearIcon className="h-8 w-8" />
              </button>
            </div>
          </>
        )}

        <div className="text-center p-4 sm:p-8 w-full">
          {isSignalActive && (
            <div className={`absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-sm sm:text-base flex justify-between items-start ${textColorClass}`}>
              <div>
                <p className="font-semibold break-words">Message: <span className="font-normal">{customMessage}</span></p>
                <div className="mt-2 font-semibold">
                  Location: {
                    location 
                    ? <span className="font-mono">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
                    : <span className="font-normal italic">{locationError || 'Acquiring coordinates...'}</span>
                  }
                </div>
              </div>
              <div className="flex-shrink-0">
                {batteryStatus && <BatteryIcon level={batteryStatus.level} charging={batteryStatus.charging} />}
              </div>
            </div>
          )}
        
          <div className={`mt-12 sm:mt-0 mb-8 sm:mb-12 transition-opacity duration-500 ${isSignalActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <WarningIcon className={`mx-auto h-24 w-24`} />
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mt-4">
              Distress Signal
              </h1>
              <p className="text-lg md:text-xl mt-2 max-w-md mx-auto opacity-80">
              Activate to emit a loud siren, flashing screen, and SOS vibration pattern.
              </p>
              <div className="text-left max-w-md mx-auto mt-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h2 className="font-bold text-lg mb-2 text-center">How to Use</h2>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                      <li>Click the <strong className="text-white">Gear icon</strong> to set your custom message and add emergency contacts.</li>
      <li>Press the large <strong className="text-red-400">Activate</strong> button to start the signal in an emergency.</li>
                      <li>Click <strong className="text-white">Send Alert to Contacts</strong> to send an SMS with your status and location.</li>
                  </ol>
              </div>
          </div>

          <button
            onClick={handleActivationRequest}
            aria-label={isSignalActive ? 'Deactivate Signal' : 'Activate Signal'}
            className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-wider shadow-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${buttonClasses} ${isSignalActive ? 'focus:ring-gray-300' : 'focus:ring-red-400'} active:scale-95`}
          >
            {isSignalActive ? 'Deactivate' : 'Activate'}
          </button>

          {isSignalActive && (
            <div className="mt-8">
                <button 
                  onClick={handleSendAlert}
                  className="bg-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={emergencyContacts.length === 0}
                  aria-label="Send Alert to Emergency Contacts"
                >
                  Send Alert to Contacts
                </button>
                {emergencyContacts.length === 0 && <p className="text-sm mt-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">No contacts configured.</p>}
            </div>
          )}
        </div>
      </main>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Activation</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to activate the distress signal?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => confirmActivation(false)} className="py-2 px-6 text-gray-300 bg-gray-700 hover:bg-gray-600 font-bold rounded-md transition">No</button>
              <button onClick={() => confirmActivation(true)} className="py-2 px-6 bg-red-600 hover:bg-red-700 font-bold rounded-md transition">Yes</button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialMessage={customMessage}
        initialContacts={emergencyContacts}
        initialIsSilentMode={isSilentMode}
        initialVibrationPattern={vibrationPattern}
        initialTextColor={textColor}
      />
    </>
  );
};

export default App;