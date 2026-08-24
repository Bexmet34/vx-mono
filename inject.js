const fs = require('fs');

const file = "apps/web/src/app/admin/page.js";
fs.writeFileSync(file, fs.readFileSync("apps/web/src/app/admin/page.backup.js", "utf-8"), "utf-8");
let code = fs.readFileSync(file, "utf-8");

const import_code = `import "./admin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatsTab from "./tabs/AdminStatsTab";
import AdminServersTab from "./tabs/AdminServersTab";`;
code = code.replace('import "./admin.css";', import_code);

const matchReturn = code.match(/return \(\s*<div className="admin-container">/);
const start_idx = matchReturn.index;
const main_idx = code.indexOf('<main className="admin-main">', start_idx);
const top_part = code.substring(0, start_idx);
const end_idx = code.lastIndexOf('</main>');

const main_str = '<main className="admin-main">';
let inner_main = code.substring(main_idx + main_str.length, end_idx);

// Replace Stats tab correctly using regex
inner_main = inner_main.replace(
  /\{\/\* STATS TAB \*\/\}[\s\S]*?(?=\{\/\* SERVER MANAGEMENT TAB \*\/\})/,
  '{activeTab === "stats" && <AdminStatsTab activeServerCount={servers.filter(s => s.is_active).length} />}\n        '
);

// Replace Servers tab correctly using regex
inner_main = inner_main.replace(
  /\{\/\* SERVER MANAGEMENT TAB \*\/\}[\s\S]*?(?=\{\/\* PLANS TAB \*\/\})/,
  '{activeTab === "servers" && <AdminServersTab servers={servers} loading={loading} setLoading={setLoading} fetchServers={fetchServers} showToast={showToast} />}\n        '
);


const new_layout_start = `return (
    <div className="flex h-screen bg-[#0f1011] overflow-hidden font-sans">
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
`;

const header_end = inner_main.indexOf('</header>');
if (header_end !== -1) {
    inner_main = inner_main.substring(header_end + '</header>'.length);
}

let modals_and_end = code.substring(end_idx + '</main>'.length);

const new_layout_mid = `
        </main>
`;

const closing_idx = modals_and_end.lastIndexOf('    </div>\\n  );\\n}');
if (closing_idx !== -1) {
    modals_and_end = modals_and_end.substring(0, closing_idx) + '      </div>\\n' + modals_and_end.substring(closing_idx);
} else {
    modals_and_end = modals_and_end.replace(/(<\/div>\s*\);\s*\})/, '  </div>\\n$1');
}

const final_code = top_part + new_layout_start + inner_main + new_layout_mid + modals_and_end;

fs.writeFileSync(file, final_code, "utf-8");
console.log("Successfully injected layout via node script using Regex!");
