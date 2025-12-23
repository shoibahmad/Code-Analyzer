// Enhanced PDF Generation Module for Comprehensive Code Analysis Reports

class AnalysisPDFGenerator {
    constructor() {
        this.currentAnalysisData = null;
        this.currentCode = null;
        this.currentLanguage = null;
    }

    // Store analysis data for PDF generation
    storeAnalysisData(code, language, data) {
        this.currentCode = code;
        this.currentLanguage = language;
        this.currentAnalysisData = data;
    }

    // Generate and download comprehensive PDF
    async generatePDF() {
        // Check if analysis data exists
        if (!this.currentAnalysisData) {
            const errorMsg = 'No analysis data available. Please analyze some code first.';
            console.error('PDF Generation Error:', errorMsg);
            if (window.toast) {
                window.toast.error(errorMsg, 'PDF Generation Failed');
            } else {
                alert(errorMsg);
            }
            return;
        }

        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            const errorMsg = 'PDF library not loaded. Please refresh the page and try again.';
            console.error('PDF Generation Error:', errorMsg);
            if (window.toast) {
                window.toast.error(errorMsg, 'PDF Generation Failed');
            } else {
                alert(errorMsg);
            }
            return;
        }

        try {
            // Show loading toast
            if (window.toast) {
                window.toast.info('Generating comprehensive PDF report...', 'Please Wait');
            }

            const { jsPDF } = window.jspdf;

            if (!jsPDF) {
                throw new Error('jsPDF constructor not found');
            }

            const doc = new jsPDF('p', 'mm', 'a4');

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Helper function to check if we need a new page
            const checkPageBreak = (requiredSpace = 20) => {
                if (yPosition + requiredSpace > pageHeight - margin - 15) {
                    doc.addPage();
                    yPosition = margin;
                    return true;
                }
                return false;
            };

            // Helper function to add wrapped text
            const addWrappedText = (text, x, y, maxWidth, fontSize = 10, color = [0, 0, 0]) => {
                doc.setFontSize(fontSize);
                doc.setTextColor(...color);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return lines.length * (fontSize * 0.5); // Return height used
            };

            // Helper function to add section header
            const addSectionHeader = (title, color = [59, 130, 246]) => {
                checkPageBreak(15);
                doc.setFillColor(...color);
                doc.rect(margin, yPosition, contentWidth, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(title, margin + 5, yPosition + 6);
                yPosition += 12;
            };

            // Helper function to add subsection
            const addSubsection = (title, content, color = [30, 41, 59]) => {
                checkPageBreak(15);
                doc.setFontSize(10);
                doc.setTextColor(...color);
                doc.setFont(undefined, 'bold');
                doc.text(title, margin, yPosition);
                yPosition += 6;

                if (content) {
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(80, 80, 80);
                    const height = addWrappedText(content, margin + 5, yPosition, contentWidth - 5, 9, [80, 80, 80]);
                    yPosition += height + 5;
                }
            };

            // Helper function to add list items
            const addListItems = (items, titleKey, contentKey, bgColor = [240, 240, 245]) => {
                items.forEach((item, idx) => {
                    checkPageBreak(20);
                    doc.setFillColor(...bgColor);
                    doc.rect(margin, yPosition, contentWidth, 15, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(30, 41, 59);
                    doc.setFont(undefined, 'bold');
                    const title = item[titleKey] || item.issue || item.risk || item.suggestion || 'Item';
                    doc.text(`${idx + 1}. ${title}`, margin + 2, yPosition + 5);

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(100, 100, 100);
                    const content = item[contentKey] || item.fix || item.mitigation || item.description || '';
                    const contentHeight = addWrappedText(content, margin + 2, yPosition + 10, contentWidth - 4, 8, [100, 100, 100]);
                    yPosition += Math.max(15, contentHeight + 12);
                });
            };

            // === COVER PAGE ===
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(32);
            doc.setFont(undefined, 'bold');
            doc.text('Comprehensive', pageWidth / 2, 80, { align: 'center' });
            doc.text('Code Analysis Report', pageWidth / 2, 95, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont(undefined, 'normal');
            doc.text(`Language: ${this.currentLanguage || 'Unknown'}`, pageWidth / 2, 120, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 130, { align: 'center' });

            // Add decorative elements
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(40, 110, pageWidth - 40, 110);
            doc.line(40, 140, pageWidth - 40, 140);

            doc.setFontSize(10);
            doc.text('Powered by ML & Gemini AI', pageWidth / 2, pageHeight - 30, { align: 'center' });

            // === NEW PAGE FOR CONTENT ===
            doc.addPage();
            yPosition = margin;

            // === TABLE OF CONTENTS ===
            addSectionHeader('📋 Table of Contents', [59, 130, 246]);
            const sections = [
                '1. Executive Summary',
                '2. ML Model Analysis',
                '3. Gemini AI Analysis',
                '   3.1 Quality Metrics',
                '   3.2 Complexity Analysis',
                '   3.3 Architecture Analysis',
                '   3.4 Code Smells',
                '   3.5 Performance Optimization',
                '   3.6 Error Handling',
                '   3.7 Documentation Quality',
                '   3.8 Testing Recommendations',
                '   3.9 Dependency Analysis',
                '   3.10 Scalability Assessment',
                '   3.11 Security Vulnerabilities',
                '   3.12 Bugs & Issues',
                '   3.13 Improvements & Best Practices',
                '   3.14 Refactoring Opportunities'
            ];

            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.setFont(undefined, 'normal');
            sections.forEach(section => {
                checkPageBreak(8);
                doc.text(section, margin + 5, yPosition);
                yPosition += 5;
            });

            yPosition += 10;

            // === EXECUTIVE SUMMARY ===
            doc.addPage();
            yPosition = margin;
            addSectionHeader('📊 Executive Summary', [59, 130, 246]);

            const mlData = this.currentAnalysisData.ml_analysis || {};
            const aiData = this.currentAnalysisData.ai_analysis || {};

            // Overall Scores
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            doc.setFont(undefined, 'bold');
            doc.text('Overall Quality Scores:', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`ML Model: ${mlData.overall_quality || 'N/A'}`, margin + 5, yPosition);
            doc.text(`Gemini AI: ${aiData.overall_quality || 'N/A'}`, margin + 70, yPosition);
            doc.text(`Analysis Time: ${this.currentAnalysisData.analysis_time?.toFixed(2) || '0'}s`, margin + 135, yPosition);
            yPosition += 12;

            // AI Summary
            if (aiData.summary) {
                addSubsection('AI Analysis Summary:', aiData.summary.replace(/🔍|📊|⚠️|✅|🎯/g, ''));
            }

            yPosition += 5;

            // === ML MODEL ANALYSIS ===
            doc.addPage();
            yPosition = margin;
            addSectionHeader('🤖 ML Model Analysis (CodeBERT)', [139, 92, 246]);

            if (mlData.summary) {
                addSubsection('Summary:', mlData.summary);
            }

            // ML Metrics
            if (mlData.metrics) {
                checkPageBreak(25);
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.setFont(undefined, 'bold');
                doc.text('Code Metrics:', margin, yPosition);
                yPosition += 6;

                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                Object.entries(mlData.metrics).forEach(([key, value]) => {
                    checkPageBreak(6);
                    doc.text(`• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, margin + 5, yPosition);
                    yPosition += 5;
                });
                yPosition += 5;
            }

            // ML Bugs
            if (mlData.bugs && mlData.bugs.length > 0) {
                addSubsection(`Bugs Detected (${mlData.bugs.length}):`, null, [239, 68, 68]);
                addListItems(mlData.bugs, 'issue', 'fix', [254, 242, 242]);
            }

            // ML Security
            if (mlData.security && mlData.security.length > 0) {
                addSubsection(`Security Issues (${mlData.security.length}):`, null, [245, 158, 11]);
                addListItems(mlData.security, 'risk', 'mitigation', [255, 251, 235]);
            }

            // ML Improvements
            if (mlData.improvements && mlData.improvements.length > 0) {
                addSubsection(`Suggested Improvements (${mlData.improvements.length}):`, null, [59, 130, 246]);
                addListItems(mlData.improvements, 'suggestion', 'example', [239, 246, 255]);
            }

            // === GEMINI AI ANALYSIS ===
            doc.addPage();
            yPosition = margin;
            addSectionHeader('🧠 Gemini AI Analysis', [16, 185, 129]);

            // AI Metrics
            if (aiData.metrics) {
                checkPageBreak(30);
                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.setFont(undefined, 'bold');
                doc.text('Quality Metrics:', margin, yPosition);
                yPosition += 6;

                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                const metricsEntries = Object.entries(aiData.metrics);
                metricsEntries.forEach(([key, value], idx) => {
                    checkPageBreak(6);
                    const xPos = margin + 5 + (idx % 2) * 90;
                    if (idx % 2 === 0 && idx > 0) yPosition += 5;
                    doc.text(`• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, xPos, yPosition);
                    if (idx % 2 === 1 || idx === metricsEntries.length - 1) yPosition += 5;
                });
                yPosition += 5;
            }

            // Complexity Analysis
            if (aiData.complexity_analysis) {
                checkPageBreak(30);
                addSubsection('🧮 Complexity Analysis:', null);

                const complexityItems = [
                    { label: 'Time Complexity', value: aiData.complexity_analysis.time_complexity },
                    { label: 'Space Complexity', value: aiData.complexity_analysis.space_complexity },
                    { label: 'Cyclomatic Complexity', value: aiData.complexity_analysis.cyclomatic_complexity },
                    { label: 'Cognitive Complexity', value: aiData.complexity_analysis.cognitive_complexity }
                ];

                complexityItems.forEach(item => {
                    if (item.value) {
                        checkPageBreak(10);
                        doc.setFontSize(9);
                        doc.setTextColor(30, 41, 59);
                        doc.setFont(undefined, 'bold');
                        doc.text(`• ${item.label}:`, margin + 5, yPosition);
                        yPosition += 5;

                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(80, 80, 80);
                        const height = addWrappedText(item.value, margin + 10, yPosition, contentWidth - 10, 8, [80, 80, 80]);
                        yPosition += height + 3;
                    }
                });
                yPosition += 5;
            }

            // Architecture Analysis
            if (aiData.architecture_analysis) {
                checkPageBreak(30);
                addSubsection('🏗️ Architecture Analysis:', null);

                const archItems = [
                    { label: 'Design Patterns', value: aiData.architecture_analysis.design_patterns },
                    { label: 'Separation of Concerns', value: aiData.architecture_analysis.separation_of_concerns },
                    { label: 'Modularity', value: aiData.architecture_analysis.modularity },
                    { label: 'Coupling', value: aiData.architecture_analysis.coupling },
                    { label: 'Cohesion', value: aiData.architecture_analysis.cohesion }
                ];

                archItems.forEach(item => {
                    if (item.value) {
                        checkPageBreak(8);
                        doc.setFontSize(9);
                        doc.setTextColor(80, 80, 80);
                        doc.text(`• ${item.label}: ${item.value}`, margin + 5, yPosition);
                        yPosition += 5;
                    }
                });
                yPosition += 5;
            }

            // Code Smells
            if (aiData.code_smells && aiData.code_smells.length > 0) {
                checkPageBreak(20);
                addSubsection(`👃 Code Smells Detected (${aiData.code_smells.length}):`, null, [245, 158, 11]);
                aiData.code_smells.forEach((smell, idx) => {
                    checkPageBreak(15);
                    doc.setFillColor(255, 251, 235);
                    doc.rect(margin, yPosition, contentWidth, 20, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(217, 119, 6);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${smell.smell || 'Code Smell'}`, margin + 2, yPosition + 5);

                    if (smell.location) {
                        doc.setFontSize(8);
                        doc.setTextColor(120, 120, 120);
                        doc.text(`Location: ${smell.location}`, margin + 2, yPosition + 10);
                        yPosition += 5;
                    }

                    doc.setFont(undefined, 'normal');
                    const refactoring = smell.refactoring || 'Review and refactor';
                    const height = addWrappedText(refactoring, margin + 2, yPosition + 10, contentWidth - 4, 8, [100, 100, 100]);
                    yPosition += Math.max(15, height + 12);
                });
            }

            // Performance Optimization
            if (aiData.performance_optimization && aiData.performance_optimization.length > 0) {
                checkPageBreak(20);
                addSubsection(`⚡ Performance Optimization (${aiData.performance_optimization.length}):`, null, [16, 185, 129]);
                aiData.performance_optimization.forEach((perf, idx) => {
                    checkPageBreak(25);
                    doc.setFillColor(236, 253, 245);
                    doc.rect(margin, yPosition, contentWidth, 25, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(5, 150, 105);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${perf.issue || 'Performance Issue'}`, margin + 2, yPosition + 5);
                    yPosition += 6;

                    doc.setFontSize(8);
                    doc.setTextColor(80, 80, 80);
                    doc.setFont(undefined, 'normal');

                    if (perf.current_approach) {
                        doc.text('Current:', margin + 2, yPosition);
                        const h1 = addWrappedText(perf.current_approach, margin + 20, yPosition, contentWidth - 22, 8, [80, 80, 80]);
                        yPosition += h1 + 3;
                    }

                    if (perf.optimized_approach) {
                        doc.text('Optimized:', margin + 2, yPosition);
                        const h2 = addWrappedText(perf.optimized_approach, margin + 20, yPosition, contentWidth - 22, 8, [5, 150, 105]);
                        yPosition += h2 + 3;
                    }

                    if (perf.expected_improvement) {
                        doc.setFont(undefined, 'italic');
                        doc.setTextColor(5, 150, 105);
                        doc.text(`Expected: ${perf.expected_improvement}`, margin + 2, yPosition);
                        yPosition += 5;
                    }

                    yPosition += 5;
                });
            }

            // Error Handling
            if (aiData.error_handling) {
                checkPageBreak(25);
                addSubsection('⚠️ Error Handling Assessment:', null);

                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.text(`Rating: ${aiData.error_handling.rating || 'N/A'}`, margin + 5, yPosition);
                yPosition += 6;

                if (aiData.error_handling.issues && aiData.error_handling.issues.length > 0) {
                    doc.text('Issues:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.error_handling.issues.forEach(issue => {
                        checkPageBreak(6);
                        doc.text(`  • ${issue}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }

                if (aiData.error_handling.recommendations && aiData.error_handling.recommendations.length > 0) {
                    checkPageBreak(6);
                    doc.text('Recommendations:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.error_handling.recommendations.forEach(rec => {
                        checkPageBreak(6);
                        doc.text(`  • ${rec}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }
                yPosition += 5;
            }

            // Documentation Quality
            if (aiData.documentation_quality) {
                checkPageBreak(25);
                addSubsection('📚 Documentation Quality:', null);

                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.text(`Rating: ${aiData.documentation_quality.rating || 'N/A'}`, margin + 5, yPosition);
                yPosition += 6;

                if (aiData.documentation_quality.missing && aiData.documentation_quality.missing.length > 0) {
                    doc.text('Missing:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.documentation_quality.missing.forEach(item => {
                        checkPageBreak(6);
                        doc.text(`  • ${item}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }

                if (aiData.documentation_quality.suggestions && aiData.documentation_quality.suggestions.length > 0) {
                    checkPageBreak(6);
                    doc.text('Suggestions:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.documentation_quality.suggestions.forEach(sug => {
                        checkPageBreak(6);
                        doc.text(`  • ${sug}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }
                yPosition += 5;
            }

            // Testing Recommendations
            if (aiData.testing_recommendations && aiData.testing_recommendations.length > 0) {
                checkPageBreak(20);
                addSubsection(`🧪 Testing Recommendations (${aiData.testing_recommendations.length}):`, null, [59, 130, 246]);
                aiData.testing_recommendations.forEach((test, idx) => {
                    checkPageBreak(20);
                    doc.setFillColor(239, 246, 255);
                    doc.rect(margin, yPosition, contentWidth, 20, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(37, 99, 235);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${test.test_type || 'Test'} - ${test.scenario || 'Test Scenario'}`, margin + 2, yPosition + 5);
                    yPosition += 6;

                    if (test.example) {
                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(80, 80, 80);
                        const height = addWrappedText(test.example, margin + 2, yPosition, contentWidth - 4, 8, [80, 80, 80]);
                        yPosition += height + 5;
                    }

                    yPosition += 5;
                });
            }

            // Dependency Analysis
            if (aiData.dependency_analysis) {
                checkPageBreak(20);
                addSubsection('📦 Dependency Analysis:', null);

                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);

                if (aiData.dependency_analysis.external_dependencies) {
                    doc.text('External Dependencies:', margin + 5, yPosition);
                    yPosition += 5;
                    const h1 = addWrappedText(aiData.dependency_analysis.external_dependencies, margin + 10, yPosition, contentWidth - 10, 8, [80, 80, 80]);
                    yPosition += h1 + 3;
                }

                if (aiData.dependency_analysis.recommendations) {
                    checkPageBreak(8);
                    doc.text('Recommendations:', margin + 5, yPosition);
                    yPosition += 5;
                    const h2 = addWrappedText(aiData.dependency_analysis.recommendations, margin + 10, yPosition, contentWidth - 10, 8, [80, 80, 80]);
                    yPosition += h2 + 3;
                }

                if (aiData.dependency_analysis.security_concerns) {
                    checkPageBreak(8);
                    doc.setTextColor(239, 68, 68);
                    doc.text('Security Concerns:', margin + 5, yPosition);
                    yPosition += 5;
                    doc.setTextColor(80, 80, 80);
                    const h3 = addWrappedText(aiData.dependency_analysis.security_concerns, margin + 10, yPosition, contentWidth - 10, 8, [80, 80, 80]);
                    yPosition += h3 + 5;
                }
            }

            // Scalability Assessment
            if (aiData.scalability_assessment) {
                checkPageBreak(25);
                addSubsection('📈 Scalability Assessment:', null);

                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);

                if (aiData.scalability_assessment.current_scalability) {
                    doc.text(`Current: ${aiData.scalability_assessment.current_scalability}`, margin + 5, yPosition);
                    yPosition += 6;
                }

                if (aiData.scalability_assessment.bottlenecks && aiData.scalability_assessment.bottlenecks.length > 0) {
                    doc.text('Bottlenecks:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.scalability_assessment.bottlenecks.forEach(b => {
                        checkPageBreak(6);
                        doc.text(`  • ${b}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }

                if (aiData.scalability_assessment.recommendations && aiData.scalability_assessment.recommendations.length > 0) {
                    checkPageBreak(6);
                    doc.text('Recommendations:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.scalability_assessment.recommendations.forEach(r => {
                        checkPageBreak(6);
                        doc.text(`  • ${r}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }
                yPosition += 5;
            }

            // Code Duplication
            if (aiData.code_duplication && aiData.code_duplication.detected !== 'No') {
                checkPageBreak(20);
                addSubsection('🔄 Code Duplication:', null, [245, 158, 11]);

                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.text(`Detected: ${aiData.code_duplication.detected || 'Unknown'}`, margin + 5, yPosition);
                yPosition += 6;

                if (aiData.code_duplication.instances && aiData.code_duplication.instances.length > 0) {
                    doc.text('Instances:', margin + 5, yPosition);
                    yPosition += 5;
                    aiData.code_duplication.instances.forEach(inst => {
                        checkPageBreak(6);
                        doc.text(`  • ${inst}`, margin + 10, yPosition);
                        yPosition += 5;
                    });
                }

                if (aiData.code_duplication.refactoring_suggestion) {
                    checkPageBreak(8);
                    doc.text('Suggestion:', margin + 5, yPosition);
                    yPosition += 5;
                    const height = addWrappedText(aiData.code_duplication.refactoring_suggestion, margin + 10, yPosition, contentWidth - 10, 8, [80, 80, 80]);
                    yPosition += height + 5;
                }
            }

            // Security Vulnerabilities
            if (aiData.security && aiData.security.length > 0) {
                checkPageBreak(20);
                addSubsection(`🔒 Security Vulnerabilities (${aiData.security.length}):`, null, [239, 68, 68]);
                addListItems(aiData.security, 'risk', 'mitigation', [254, 242, 242]);
            }

            // Bugs & Issues
            if (aiData.bugs && aiData.bugs.length > 0) {
                checkPageBreak(20);
                addSubsection(`🐛 Bugs & Issues (${aiData.bugs.length}):`, null, [239, 68, 68]);
                addListItems(aiData.bugs, 'issue', 'fix', [254, 242, 242]);
            }

            // Improvements
            if (aiData.improvements && aiData.improvements.length > 0) {
                checkPageBreak(20);
                addSubsection(`💡 Suggested Improvements (${aiData.improvements.length}):`, null, [59, 130, 246]);
                addListItems(aiData.improvements, 'suggestion', 'example', [239, 246, 255]);
            }

            // Best Practices
            if (aiData.best_practices && aiData.best_practices.length > 0) {
                checkPageBreak(20);
                addSubsection(`⭐ Best Practices (${aiData.best_practices.length}):`, null, [16, 185, 129]);
                aiData.best_practices.forEach((bp, idx) => {
                    checkPageBreak(20);
                    doc.setFillColor(236, 253, 245);
                    doc.rect(margin, yPosition, contentWidth, 20, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(5, 150, 105);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${bp.practice || 'Best Practice'}`, margin + 2, yPosition + 5);
                    yPosition += 6;

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(80, 80, 80);

                    if (bp.current) {
                        doc.text('Current:', margin + 2, yPosition);
                        const h1 = addWrappedText(bp.current, margin + 20, yPosition, contentWidth - 22, 8, [80, 80, 80]);
                        yPosition += h1 + 3;
                    }

                    if (bp.recommended) {
                        doc.text('Recommended:', margin + 2, yPosition);
                        const h2 = addWrappedText(bp.recommended, margin + 20, yPosition, contentWidth - 22, 8, [5, 150, 105]);
                        yPosition += h2 + 5;
                    }

                    yPosition += 5;
                });
            }

            // Refactoring Opportunities
            if (aiData.refactoring_opportunities && aiData.refactoring_opportunities.length > 0) {
                checkPageBreak(20);
                addSubsection(`🔨 Refactoring Opportunities (${aiData.refactoring_opportunities.length}):`, null, [139, 92, 246]);
                aiData.refactoring_opportunities.forEach((refactor, idx) => {
                    checkPageBreak(25);
                    doc.setFillColor(245, 243, 255);
                    doc.rect(margin, yPosition, contentWidth, 20, 'F');

                    doc.setFontSize(9);
                    doc.setTextColor(109, 40, 217);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${idx + 1}. ${refactor.area || 'Refactoring Area'}`, margin + 2, yPosition + 5);
                    yPosition += 6;

                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(80, 80, 80);

                    if (refactor.reason) {
                        doc.text('Why:', margin + 2, yPosition);
                        const h1 = addWrappedText(refactor.reason, margin + 15, yPosition, contentWidth - 17, 8, [80, 80, 80]);
                        yPosition += h1 + 3;
                    }

                    if (refactor.approach) {
                        doc.text('How:', margin + 2, yPosition);
                        const h2 = addWrappedText(refactor.approach, margin + 15, yPosition, contentWidth - 17, 8, [80, 80, 80]);
                        yPosition += h2 + 3;
                    }

                    if (refactor.benefit) {
                        doc.setFont(undefined, 'italic');
                        doc.setTextColor(109, 40, 217);
                        doc.text('Benefit:', margin + 2, yPosition);
                        doc.setTextColor(80, 80, 80);
                        const h3 = addWrappedText(refactor.benefit, margin + 15, yPosition, contentWidth - 17, 8, [80, 80, 80]);
                        yPosition += h3 + 5;
                    }

                    yPosition += 5;
                });
            }

            // === FOOTER ON ALL PAGES ===
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFillColor(240, 240, 245);
                doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`AI Code Analyzer - Comprehensive Report`, margin, pageHeight - 8);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
                doc.text(`© 2025 Alisha Shad`, pageWidth - margin - 30, pageHeight - 8);
            }

            // Save PDF
            const fileName = `comprehensive-analysis-${this.currentLanguage}-${Date.now()}.pdf`;
            doc.save(fileName);

            if (window.toast) {
                window.toast.success('Comprehensive PDF downloaded successfully!', 'Download Complete');
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            console.error('Error stack:', error.stack);
            console.error('Analysis data:', this.currentAnalysisData);

            const errorMsg = `Failed to generate PDF: ${error.message}. Please try again or contact support.`;
            if (window.toast) {
                window.toast.error(errorMsg, 'PDF Generation Failed');
            } else {
                alert(errorMsg);
            }
        }
    }
}

// Create global instance
window.pdfGenerator = new AnalysisPDFGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisPDFGenerator;
}
