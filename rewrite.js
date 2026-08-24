const fs = require('fs');
let code = fs.readFileSync('apps/web/src/app/admin/page.backup.js', 'utf8');

code = code.replace(
  'import "./admin.css";',
  'import "./admin.css";\nimport AdminSidebar from "./components/AdminSidebar";\nimport AdminHeader from "./components/AdminHeader";\nimport AdminStatsTab from "./tabs/AdminStatsTab";\nimport AdminServersTab from "./tabs/AdminServersTab";'
);

const returnStr = '  return (\n    <div className="admin-container">\n      {/* Mobile Top App Bar */}';
let returnIndex = code.indexOf(returnStr);

const mainContentIndex = code.indexOf('<main className="admin-main">');

if (returnIndex !== -1 && mainContentIndex !== -1) {
  const topPart = code.substring(0, returnIndex);
  
  const wrapperStartStr = '<div className="admin-content-wrapper">';
  const wrapperStart = code.indexOf(wrapperStartStr, mainContentIndex);
  
  const endMain = code.lastIndexOf('</main>');
  let mainContentPart = code.substring(wrapperStart + wrapperStartStr.length, endMain);
  
  const statsStart = mainContentPart.indexOf('{/* STATS TAB */}');
  const statsEnd = mainContentPart.indexOf('{/* SERVER MANAGEMENT TAB */}');
  
  if (statsStart !== -1 && statsEnd !== -1) {
    mainContentPart = mainContentPart.substring(0, statsStart) + 
      '{activeTab === "stats" && <AdminStatsTab activeServerCount={servers.filter(s => s.is_active).length} />}\n        ' +
      mainContentPart.substring(statsEnd);
  }
  
  const serversStart2 = mainContentPart.indexOf('{/* SERVER MANAGEMENT TAB */}');
  const serversEnd2 = mainContentPart.indexOf('{/* PLANS TAB */}');
  
  if (serversStart2 !== -1 && serversEnd2 !== -1) {
    mainContentPart = mainContentPart.substring(0, serversStart2) + 
      '{activeTab === "servers" && <AdminServersTab servers={servers} loading={loading} setLoading={setLoading} fetchServers={fetchServers} showToast={showToast} />}\n        ' +
      mainContentPart.substring(serversEnd2);
  }
  
  const newLayout = `  return (
    <div className="flex h-screen bg-[#0f1011] overflow-hidden">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          loading={loading} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto w-full">
            {message && (
              <div className={\`mb-6 p-4 rounded-xl flex items-start gap-3 \${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20'}\`}>
                {message.type === 'error' ? <AlertCircle size={20} className="mt-0.5 shrink-0" /> : <CheckCircle size={20} className="mt-0.5 shrink-0" />}
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}
`;

  const layoutFooter = `
          </div>
        </main>
      </div>
    </div>
  );
}
`;
  
  const lastClosingDiv = mainContentPart.lastIndexOf('</div>');
  if (lastClosingDiv !== -1) {
    mainContentPart = mainContentPart.substring(0, lastClosingDiv);
  }

  const finalCode = topPart + newLayout + mainContentPart + layoutFooter;
  
  fs.writeFileSync('apps/web/src/app/admin/page.js', finalCode);
  console.log('Successfully injected new layout into page.js');
} else {
  console.log('Could not find returnIndex or mainContentIndex');
}
