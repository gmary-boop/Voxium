import { Smartphone, CheckCircle, Terminal, HelpCircle, Code, AppWindow } from "lucide-react";

export default function MobileSetup() {
  const steps = [
    {
      title: "Instalar Capacitor CLI",
      desc: "Instala el puente móvil nativo para empaquetar el código HTML/JS compilado de Voxium.",
      cmd: "npm i @capacitor/core @capacitor/cli"
    },
    {
      title: "Inicializar Configuración Móvil",
      desc: "Configura el identificador único del paquete y el directorio de origen compilado.",
      cmd: "npx cap init Voxium com.voxiom.app --web-dir=dist"
    },
    {
      title: "Añadir Plataforma Android & iOS",
      desc: "Crea los subproyectos nativos oficiales para Android Studio y Xcode.",
      cmd: "npm i @capacitor/android @capacitor/ios\nnpx cap add android\nnpx cap add ios"
    },
    {
      title: "Compilar y Sincronizar",
      desc: "Genera el build de Voxium y sincronízalo inmediatamente con las carpetas nativas.",
      cmd: "npm run build\nnpx cap sync"
    },
    {
      title: "Ejecutar en Emulador o Dispositivo Real",
      desc: "Abre los proyectos en los entornos oficiales de desarrollo móvil para firmar y publicar.",
      cmd: "npx cap open android\nnpx cap open ios"
    }
  ];

  return (
    <div id="voxium_mobile_setup" className="max-w-md md:max-w-2xl mx-auto p-4 bg-slate-950 border border-slate-900 rounded-2xl shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
        <Smartphone size={20} className="text-indigo-400" />
        <div>
          <h2 className="font-extrabold text-sm text-slate-100">Guía de Exportación a Android & iPhone (iOS)</h2>
          <p className="text-[10px] text-slate-500">Empaqueta Voxium usando Capacitor para subirlo a Google Play y Apple App Store</p>
        </div>
      </div>

      {/* Visual mobile simulation card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Step-by-step list */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300">Pasos de Integración:</h3>
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3 text-xs leading-relaxed">
              <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-200">{step.title}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">{step.desc}</p>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono text-[9px] text-indigo-300 mt-2 whitespace-pre-wrap select-all">
                  {step.cmd}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration template preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2">
              <Code size={14} className="text-indigo-400" />
              <span className="font-bold text-[11px] text-slate-200">capacitor.config.json (Plantilla recomendada)</span>
            </div>
            
            <pre className="font-mono text-[9px] text-slate-400 overflow-x-auto bg-slate-950 p-2.5 rounded-lg border border-slate-900 leading-relaxed select-all">
{`{
  "appId": "com.voxiom.app",
  "appName": "Voxium",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "url": "${window.location.origin}",
    "cleartext": true
  }
}`}
            </pre>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Nota: El parámetro de servidor <code className="text-indigo-400 font-mono">"url"</code> permite probar la aplicación en tiempo real en tu teléfono físico apuntando directamente al servidor de prueba antes de generar el paquete final offline.
            </p>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/40 p-3.5 rounded-xl text-[10px] text-slate-400 space-y-1.5 leading-relaxed">
            <h4 className="font-bold text-indigo-300 flex items-center space-x-1">
              <AppWindow size={12} />
              <span>Hosting y Publicación Web</span>
            </h4>
            <p>
              ¡Para publicar la plataforma Voxium de manera económica y duradera, te sugerimos utilizar **Google Cloud Run** o **Firebase Hosting**! Ambas plataformas ofrecen excelentes planes gratuitos y un escalado automático confiable.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
