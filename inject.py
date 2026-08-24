import sys
import re

with open("apps/web/src/app/admin/page.js", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add Imports
import_code = """import "./admin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatsTab from "./tabs/AdminStatsTab";
import AdminServersTab from "./tabs/AdminServersTab";"""
code = code.replace('import "./admin.css";', import_code)

# 2. Extract Top and Bottom and replace layout
# Find start of return
start_idx = code.rfind('  return (\n    <div className="admin-container">')
if start_idx == -1:
    print("Failed to find main return")
    sys.exit(1)

# Find start of main
main_idx = code.find('<main className="admin-main">', start_idx)
if main_idx == -1:
    print("Failed to find main")
    sys.exit(1)

# We want to replace from start_idx up to main_idx + len('<main className="admin-main">')
top_part = code[:start_idx]
# We also need to extract the closing tags
end_idx = code.rfind('      </main>\n    </div>\n  );\n}')
if end_idx == -1:
    print("Failed to find closing tags")
    sys.exit(1)

inner_main = code[main_idx + len('<main className="admin-main">') : end_idx]

# We must remove `<div className="admin-content-wrapper">` from the start of inner_main, 
# and its closing `</div>` at the end of inner_main
wrapper_start = '<div className="admin-content-wrapper">'
if inner_main.strip().startswith(wrapper_start):
    inner_main = inner_main.split(wrapper_start, 1)[1]
    # remove last </div>
    last_div = inner_main.rfind('</div>')
    if last_div != -1:
        inner_main = inner_main[:last_div] + inner_main[last_div+6:]

# Now replace stats and servers in inner_main
# 3. STATS TAB
stats_start = inner_main.find('{/* STATS TAB */}')
servers_start = inner_main.find('{/* SERVER MANAGEMENT TAB */}')
if stats_start != -1 and servers_start != -1:
    inner_main = inner_main[:stats_start] + '{activeTab === "stats" && <AdminStatsTab activeServerCount={servers.filter(s => s.is_active).length} />}\n        ' + inner_main[servers_start:]

# 4. SERVERS TAB
servers_start = inner_main.find('{/* SERVER MANAGEMENT TAB */}')
plans_start = inner_main.find('{/* PLANS TAB */}')
if servers_start != -1 and plans_start != -1:
    inner_main = inner_main[:servers_start] + '{activeTab === "servers" && <AdminServersTab servers={servers} loading={loading} setLoading={setLoading} fetchServers={fetchServers} showToast={showToast} />}\n        ' + inner_main[plans_start:]

new_layout_start = """  return (
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
          <div className="max-w-7xl mx-auto w-full admin-content-wrapper">"""

new_layout_end = """          </div>
        </main>
      </div>
    </div>
  );
}"""

# wait, we must also remove the old Admin Header from inner_main:
#          <header className="admin-header"> ... </header>
#          {loading ? ... } : ( ... )
header_end = inner_main.find('</header>')
if header_end != -1:
    inner_main = inner_main[header_end + len('</header>'):]

# Also remove the `{loading ? ( ... ) : ( <div className="animate-slide-up"> ...` wrapper?
# Actually, the loading spinner is good to keep for the other tabs. Let's just keep the loading block.
# Wait, my AdminHeader has `loading={loading}` so I don't strictly need the global one, but let's keep it to not break things.

final_code = top_part + new_layout_start + inner_main + new_layout_end

with open("apps/web/src/app/admin/page.js", "w", encoding="utf-8") as f:
    f.write(final_code)

print("Successfully injected layout via python script!")
