const fs = require('fs');
const file = 'apps/web/src/app/admin/page.js';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace the entire top shell (from `<div className="admin-container">` up to `          {loading ? (`)
const shellStart = code.indexOf('    <div className="admin-container">');
const shellEnd = code.indexOf('          {loading ? (');

if (shellStart === -1 || shellEnd === -1) {
  console.log("Could not find shell boundaries", shellStart, shellEnd);
  process.exit(1);
}

const newShell = `    <div className="flex h-screen bg-[#0f1011] overflow-hidden">
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

code = code.substring(0, shellStart) + newShell + code.substring(shellEnd);

// 2. Replace the bottom shell closing tags
// Find the exact closing tags of the old layout
const oldClosing = `          )}
        </main>
      </div>
    </div>
  );
}`;
const newClosing = `          )}
          </div>
        </main>
      </div>
    </div>
  );
}`;

code = code.replace(oldClosing, newClosing);

// 3. Replace {activeTab === "stats" && ...
const statsStart = code.indexOf('{/* STATS TAB */}');
const serversStart = code.indexOf('{/* SERVER MANAGEMENT TAB */}');
if (statsStart !== -1 && serversStart !== -1) {
  code = code.substring(0, statsStart) + 
    '{activeTab === "stats" && <AdminStatsTab activeServerCount={servers.filter(s => s.is_active).length} />}\n        ' +
    code.substring(serversStart);
}

// 4. Replace {activeTab === "servers" && ...
const serversStart2 = code.indexOf('{/* SERVER MANAGEMENT TAB */}');
const plansStart = code.indexOf('{/* PLANS TAB */}');
if (serversStart2 !== -1 && plansStart !== -1) {
  code = code.substring(0, serversStart2) + 
    '{activeTab === "servers" && <AdminServersTab servers={servers} loading={loading} setLoading={setLoading} fetchServers={fetchServers} showToast={showToast} />}\n        ' +
    code.substring(plansStart);
}

// Write back
fs.writeFileSync(file, code);
console.log("Successfully replaced layout");
