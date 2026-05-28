import re

file_path = "frontend/src/pages/Admin/AdminDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace("import AdminIntelligence from './AdminIntelligence';\nimport './AdminDashboard.css';", "import AdminIntelligence from './AdminIntelligence';\nimport PublishPackageModal from './PublishPackageModal';\nimport './AdminDashboard.css';")

# 2. State
content = content.replace("  const [submittingPkg, setSubmittingPkg] = useState(false);\n\n  // Stats", "  const [submittingPkg, setSubmittingPkg] = useState(false);\n  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);\n\n  // Stats")

# 3. handleCreatePackage success
content = content.replace("      setPackages(pkgsRes.data || pkgsRes || []);\n    } catch (err) {", "      setPackages(pkgsRes.data || pkgsRes || []);\n      setIsPublishModalOpen(false);\n    } catch (err) {")

# 4. Replace form block
form_pattern = r'\{\/\* Add New Experience Form Card \*\/\}.*?\{\/\* Inventory Grid View \*\/\}'
replacement = """{/* Add New Experience Trigger Banner */}
                    <div className="admin-card add-experience-banner" id="add-exp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', gridColumn: '1 / -1' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}><i className="fa-solid fa-plane-departure" style={{ color: '#d4af37', marginRight: '10px' }}></i> Publish New Package</h3>
                        <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Use the interactive full-screen builder to craft a premium experience.</p>
                      </div>
                      <button 
                        onClick={() => setIsPublishModalOpen(true)}
                        style={{ background: '#d4af37', color: '#000', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}
                      >
                        <i className="fa-solid fa-plus"></i> Open Package Builder
                      </button>
                    </div>

                    <PublishPackageModal 
                      isOpen={isPublishModalOpen} 
                      onClose={() => setIsPublishModalOpen(false)} 
                      onSubmit={handleCreatePackage}
                      formData={formData}
                      setFormData={setFormData}
                      itinerary={itinerary}
                      setItinerary={setItinerary}
                      getSupervisorsList={getSupervisorsList}
                      destinationsList={destinationsList}
                      activitiesList={activitiesList}
                      submittingPkg={submittingPkg}
                      calculateEstimatedPackagePrice={calculateEstimatedPackagePrice}
                    />

                    {/* Inventory Grid View */}"""

content = re.sub(form_pattern, replacement, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched successfully")
