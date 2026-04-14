document.addEventListener("DOMContentLoaded", () => {
    
    // ---------------- SIDEBAR NAVIGATION LOGIC ---------------- //
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('active')) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const targetId = item.dataset.target;
            
            sections.forEach(sec => {
                sec.classList.remove('active');
            });
            
            setTimeout(() => {
                const targetEl = document.getElementById(targetId);
                if(targetEl) {
                    targetEl.classList.add('active');
                }
            }, 50); 
        });
    });

    // ---------------- PREMIUM ADVANCED MICRO-INTERACTIONS ---------------- //
    
    // 1. Cursor Glow Follower
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            if(cursorGlow) {
                cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        });
    });

    // 2. 3D Glass Tilt & Inner Glow Effect (Now matching refined scaled 1.04-1.05 spec)
    const cards = document.querySelectorAll('.interactive-card:not(.canvas-wrapper)');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Subtle premium tilt
            const tiltX = ((y - centerY) / centerY) * -4;
            let tiltY = ((x - centerX) / centerX) * 4;
            
            if (card.classList.contains('fact-back')) {
                tiltY += 180;
            }
            
            // Set 1.04 scale to fulfill 1.03-1.05 hover requirements for dark orange spec
            card.style.transform = `perspective(1500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.04, 1.04, 1.04)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // 3. Info Card click-to-select functionality
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const h3 = card.querySelector('h3');
            if (h3) {
                const unitName = h3.textContent.toLowerCase().trim();
                const section = card.closest('.dashboard-section');
                if (section) {
                    const targetPill = section.querySelector(`.pill-btn[data-unit="${unitName}"]`);
                    if (targetPill) {
                        targetPill.click();
                        
                        // Add brief click animation
                        card.style.transition = 'transform 0.15s ease-out';
                        card.style.transform = `perspective(1500px) scale3d(0.97, 0.97, 0.97)`;
                        setTimeout(() => {
                            card.style.transform = '';
                            card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                        }, 150);
                    }
                }
            }
        });
    });

    // 4. Magnetic Hover Details for Icons and small elements
    const magnetics = document.querySelectorAll('.magnetic-el');
    magnetics.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            el.style.transition = 'none';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    });

    // ---------------- ANIMATED NUMBER LOGIC ---------------- //
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const currentVal = (easeProgress * (end - start) + start);
            obj.innerHTML = currentVal.toFixed(2);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toFixed(2);
            }
        };
        window.requestAnimationFrame(step);
    }

    // ---------------- PREMIUM TWO-WAY CONVERTER LOGIC ---------------- //
    const conversionConfig = {
        distance: {
            leftUnits: { km: 1000, m: 1, cm: 0.01 },
            rightUnits: { angula: 0.01875, hasta: 0.45, dhanus: 1.8, yojana: 13000 },
            leftLabels: { km: "Kilometers", m: "Meters", cm: "Centimeters" },
            rightLabels: { angula: "Angulas", hasta: "Hastas", dhanus: "Dhanus", yojana: "Yojanas" }
        },
        time: {
            leftUnits: { s: 1, min: 60, hr: 3600 },
            rightUnits: { nimesha: 0.213, kshana: 1.6, ghati: 1440, muhurta: 2880 },
            leftLabels: { s: "Seconds", min: "Minutes", hr: "Hours" },
            rightLabels: { nimesha: "Nimeshas", kshana: "Kshanas", ghati: "Ghatis", muhurta: "Muhurtas" }
        },
        weight: {
            leftUnits: { g: 1, kg: 1000 },
            rightUnits: { ratti: 0.12, masha: 0.97, tola: 11.66, pala: 48 },
            leftLabels: { g: "Grams", kg: "Kilograms" },
            rightLabels: { ratti: "Rattis", masha: "Mashas", tola: "Tolas", pala: "Palas" }
        }
    };

    function animateInput(inputEl, end, duration) {
        const start = parseFloat(inputEl.value) || 0;
        let startTimestamp = null;
        if(inputEl._animId) window.cancelAnimationFrame(inputEl._animId);

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = (easeProgress * (end - start) + start);
            
            let displayVal = currentVal;
            if(Math.abs(currentVal) < 0.01 && currentVal !== 0) displayVal = currentVal.toPrecision(3);
            else displayVal = parseFloat(currentVal.toFixed(4));
            
            inputEl.value = displayVal;
            
            if (progress < 1) {
                inputEl._animId = window.requestAnimationFrame(step);
            } else {
                let finalDisplay = end;
                if(Math.abs(end) < 0.01 && end !== 0) finalDisplay = end.toPrecision(3);
                else finalDisplay = parseFloat(end.toFixed(4));
                inputEl.value = finalDisplay;
            }
        };
        inputEl._animId = window.requestAnimationFrame(step);
    }

    Object.keys(conversionConfig).forEach(tabId => {
        const section = document.getElementById(tabId);
        if(!section) return;

        const controls = section.querySelector('.converter-controls');
        const leftInput = section.querySelector('.left-input');
        const rightInput = section.querySelector('.right-input');
        const leftLabel = section.querySelector('.left-label');
        const rightLabel = section.querySelector('.right-label');
        const swapBtn = section.querySelector('.swap-container');
        
        const leftPills = section.querySelectorAll('.left-side .pill-btn');
        const rightPills = section.querySelectorAll('.right-side .pill-btn');
        const leftSlider = section.querySelector('.left-side .pill-slider');
        const rightSlider = section.querySelector('.right-side .pill-slider');

        if(!leftInput || !rightInput || !swapBtn) return;

        let isLeftToRight = true; 
        
        const getActiveUnit = (pills) => {
            if(!pills.length) return null;
            const active = Array.from(pills).find(p => p.classList.contains('active'));
            return active ? active.dataset.unit : pills[0].dataset.unit;
        };

        let state = {
            leftUnit: getActiveUnit(leftPills),
            rightUnit: getActiveUnit(rightPills),
            config: conversionConfig[tabId]
        };

        function highlightActiveCards() {
            const allCards = section.querySelectorAll('.info-card');
            allCards.forEach(card => {
                const h3 = card.querySelector('h3');
                if (h3) {
                    const unitName = h3.textContent.toLowerCase().trim();
                    if (unitName === state.leftUnit || unitName === state.rightUnit) {
                        card.classList.add('active-unit');
                    } else {
                        card.classList.remove('active-unit');
                    }
                }
            });
        }
        
        // Initial highlight
        highlightActiveCards();

        function updateSlider(pills, slider) {
            if(!pills.length || !slider) return;
            const active = Array.from(pills).find(p => p.classList.contains('active'));
            if(active) {
                slider.style.width = active.offsetWidth + 'px';
                slider.style.left = active.offsetLeft + 'px';
            }
        }
        
        setTimeout(() => {
            updateSlider(leftPills, leftSlider);
            updateSlider(rightPills, rightSlider);
        }, 150);

        window.addEventListener('resize', () => {
            updateSlider(leftPills, leftSlider);
            updateSlider(rightPills, rightSlider);
        });
        
        function getConversion(val, fromUnit, toUnit, fromDict, toDict) {
            const baseVal = val * fromDict[fromUnit];
            return baseVal / toDict[toUnit];
        }

        function convertLeftToRight(animate = true) {
            const val = parseFloat(leftInput.value);
            if(isNaN(val)) { rightInput.value = ''; return; }
            const res = getConversion(val, state.leftUnit, state.rightUnit, state.config.leftUnits, state.config.rightUnits);
            if(animate) animateInput(rightInput, res, 600);
            else rightInput.value = Math.abs(res) < 0.01 && res !== 0 ? res.toPrecision(3) : parseFloat(res.toFixed(4));
        }

        function convertRightToLeft(animate = true) {
            const val = parseFloat(rightInput.value);
            if(isNaN(val)) { leftInput.value = ''; return; }
            const res = getConversion(val, state.rightUnit, state.leftUnit, state.config.rightUnits, state.config.leftUnits);
            if(animate) animateInput(leftInput, res, 600);
            else leftInput.value = Math.abs(res) < 0.01 && res !== 0 ? res.toPrecision(3) : parseFloat(res.toFixed(4));
        }

        leftInput.addEventListener('input', () => convertLeftToRight(false));
        rightInput.addEventListener('input', () => convertRightToLeft(false));

        leftPills.forEach(pill => {
            pill.addEventListener('click', () => {
                leftPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.leftUnit = pill.dataset.unit;
                leftLabel.textContent = state.config.leftLabels[state.leftUnit];
                updateSlider(leftPills, leftSlider);
                
                highlightActiveCards();

                if(leftInput.value && !rightInput.value) convertLeftToRight(true);
                else if(rightInput.value && !leftInput.value) convertRightToLeft(true);
                else convertLeftToRight(true);
            });
        });

        rightPills.forEach(pill => {
            pill.addEventListener('click', () => {
                rightPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.rightUnit = pill.dataset.unit;
                rightLabel.textContent = state.config.rightLabels[state.rightUnit];
                updateSlider(rightPills, rightSlider);
                
                highlightActiveCards();

                if(rightInput.value && !leftInput.value) convertRightToLeft(true);
                else convertLeftToRight(true);
            });
        });

        swapBtn.addEventListener('click', () => {
            isLeftToRight = !isLeftToRight;
            const icon = swapBtn.querySelector('.swap-icon');
            icon.style.transform = `rotate(${isLeftToRight ? 0 : 180}deg)`;
            swapBtn.classList.add('pulse');
            setTimeout(() => swapBtn.classList.remove('pulse'), 400);
            
            controls.style.opacity = '0';
            setTimeout(() => {
                controls.classList.toggle('reversed');
                controls.style.opacity = '1';
                setTimeout(() => {
                    updateSlider(leftPills, leftSlider);
                    updateSlider(rightPills, rightSlider);
                }, 50);
            }, 300);
        });
        
        leftLabel.textContent = state.config.leftLabels[state.leftUnit];
        rightLabel.textContent = state.config.rightLabels[state.rightUnit];
    });

    // ---------------- DYNAMIC FUN FACTS SYSTEM ---------------- //
    const factSets = [
        [
            { icon: "ph-drop", title: "Water Clocks", text: "Ancient Indians tracked time with Ghatika Yantras—hemispherical copper bowls with a precise hole that sank entirely after exactly 24 minutes." },
            { icon: "ph-plant", title: "The Perfect Seed", text: "Ratti seeds (Abrus precatorius) were used because their weight varies by less than 5% anywhere in nature, forming the perfect prehistoric standard." },
            { icon: "ph-globe-hemisphere-east", title: "Measuring Cosmos", text: "Aryabhata used Yojanas to calculate the Earth's circumference in the 5th century, achieving an accuracy remarkably close to modern geodetic measurements." }
        ],
        [
            { icon: "ph-infinity", title: "Concept of Zero", text: "The concept of zero as a number was fully developed in India around the 5th century by astronomers like Brahmagupta." },
            { icon: "ph-ruler", title: "Decimal System", text: "Excavations in Harappa show precise decimal-based rulers where exactly 10 smallest divisions mapped precisely to the next larger unit." },
            { icon: "ph-sun-dim", title: "Heliocentrism", text: "Long before Copernicus, ancient Vedic texts proposed a central Sun pulling planets, conceptually framing the earliest heliocentric theories." }
        ],
        [
            { icon: "ph-atom", title: "Ancient Atoms", text: "The philosophy of Vaisheshika postulated 'Anu' (atoms) as indestructible particles composing all matter, centuries before Greek theories." },
            { icon: "ph-sword", title: "Wootz Steel", text: "South Indian 'Wootz' crucible steel produced the legendary Damascus blades, characterized by incredibly tough micro-lattice carbon nano-structures." },
            { icon: "ph-sailboat", title: "Shipbuilding", text: "Ancient texts rigorously classified ships by length and cabin configurations using standard 'Hasta' measurements for oceanic voyages." }
        ],
        [
            { icon: "ph-moon", title: "Lunar Mansions", text: "The night sky was precisely divided into 27 'Nakshatras' (lunar mansions), tracking the moon's exact passage across the ecliptic plane." },
            { icon: "ph-math-operations", title: "Infinite Series", text: "Madhava of Sangamagrama founded the Kerala school of astronomy and pioneered infinite series for trigonometric functions centuries before Newton." },
            { icon: "ph-book-open", title: "Bakhshali Manuscript", text: "The Bakhshali manuscript contains the earliest recorded use of a placeholder dot for zero, solving complex non-linear mathematical equations." }
        ],
        [
            { icon: "ph-buildings", title: "Vastu Shastra", text: "The ancient architectural science 'Vastu Shastra' dictated temple and city geometry meticulously using fractal symmetry and Angula ratios." },
            { icon: "ph-stethoscope", title: "Sushruta Samhita", text: "Sushruta's compendium documented over 300 surgical procedures and 120 geometric surgical instruments built to exact specifications." },
            { icon: "ph-scales", title: "Indus Weights", text: "The Indus Valley Civilization possessed standard chert stone weights utilizing a precise binary sequence: 1, 2, 4, 8, 16, 32." }
        ],
        [
            { icon: "ph-eye", title: "Light & Optics", text: "The Chakshusha philosophy conceptually separated emitting light from visual perception, understanding light as rays of moving particles." },
            { icon: "ph-calendar", title: "Yuga Cycles", text: "Cosmological 'Yugas' measured immense multi-million-year epochs, revealing an incredibly expansive pre-historic view of universal timescales." },
            { icon: "ph-compass", title: "Magnetic Maps", text: "Maccha Yantra, an ancient iron-fish suspended in a bowl of oil, was utilized as one of the world's earliest maritime compasses." }
        ],
        [
            { icon: "ph-leaf", title: "Ayurvedic Dosages", text: "Ayurveda rigorously tracked incredibly fine botanical weight measurements—like the 'Trasarenu' (mote of dust)—for micro-dosing potent alkaloids." },
            { icon: "ph-cloud-rain", title: "Rain Gauges", text: "The Arthashastra detailed standard copper vessels used as rain gauges ('Varshamana') to tax agriculture based strictly on exact seasonal precipitation." },
            { icon: "ph-music-notes", title: "Acoustic Pitch", text: "Indian classical music isolated 22 distinct 'Shrutis' (microtones) natively within an octave, maintaining precise mathematical frequency ratios." }
        ],
        [
            { icon: "ph-shooting-star", title: "Comet Observations", text: "Varahamihira's Brihat Samhita extensively cataloged dozens of comets, predicting their orbital returns based on advanced mathematical modeling." },
            { icon: "ph-triangle", title: "Pythagorean Theorem", text: "The Sulba Sutras described the Pythagorean theorem for constructing sacred fire altars long before Pythagoras himself was born." },
            { icon: "ph-yarn", title: "Finest Weaves", text: "Indian muslin cloth was woven so incredibly fine that a 50-yard continuous piece could be seamlessly pulled entirely through a standard finger-ring." }
        ],
        [
            { icon: "ph-wind", title: "Speed of Wind", text: "Ancient scholars built anemometers and wind vanes, categorizing directional wind velocities specifically to aid vast oceanic monsoon deployments." },
            { icon: "ph-hand-coins", title: "Punch-Marked Coins", text: "Karshapana coins adhered to extremely rigid purity and exact mass scales (32 rattis) enforced by royal assayers thousands of years ago." },
            { icon: "ph-plant", title: "Botanical Clocks", text: "Certain sacred gardens were planted with species strictly selected to bloom in sequence, forming a living, biological floral clock." }
        ],
        [
            { icon: "ph-mountain", title: "Altitude Measurement", text: "Using shadow sticks and basic trigonometry, ancient surveyors calculated massive lateral distances and mountain elevations with surprising accuracy." },
            { icon: "ph-planet", title: "Retrograde Motion", text: "Indian astronomers perfectly modeled the retrograde motion of Mars and Jupiter using mathematical epicycles hundreds of years before Ptolemy." },
            { icon: "ph-drop-half", title: "Clepsydra Accuracy", text: "Massive temple water clocks were calibrated using standardized mercury drops rather than water to avoid temperature-induced viscosity variations." }
        ],
        [
            { icon: "ph-clock", title: "Micro-Time", text: "The 'Paramanu' was defined as the absolute smallest unit of time—calculated as approximately 1/34,000th of a modern second." },
            { icon: "ph-cube", title: "Magic Squares", text: "Complex 4x4 'lo-shu' style magic squares were carved into shrines, forming perfectly balanced multi-directional numeric sequences." },
            { icon: "ph-line-segments", title: "Sine Tables", text: "Aryabhata pioneered the first table of 'Jya' (Sine) differences, creating the foundational pillar of modern global trigonometry." }
        ],
        [
            { icon: "ph-fire", title: "Metallurgy", text: "The Iron Pillar of Delhi, forged 1,600 years ago using a uniquely extracted high-phosphorus iron, stands today completely free of rust." },
            { icon: "ph-rocket", title: "Rocket Artillery", text: "Mysoorean engineers developed the first mass-reusable iron-cased rockets, utilizing precise aerodynamic weight-balancing for maximum stabilizing range." },
            { icon: "ph-hammer", title: "Seamless Globes", text: "Mughal metallurgists mastered a lost-wax casting technique to create completely seamless celestial globes without any weld marks." }
        ],
        [
            { icon: "ph-currency-inr", title: "Decimal Currency", text: "The ancient Rupee was historically subdivided sequentially into 16 Anas, 64 Paises, and 192 Pies, maintaining strict volumetric silver ratios." },
            { icon: "ph-first-aid", title: "Rhinoplasty", text: "Sushruta successfully performed some of the world's earliest complex reconstructive plastic surgeries, measuring skin grafts precisely via leaf templates." },
            { icon: "ph-shield", title: "Fort Ratios", text: "Impenetrable fortresses like Kumbhalgarh mapped perimeter wall thickness strictly directly proportional to the calculated velocity of incoming medieval artillery." }
        ],
        [
            { icon: "ph-moon-stars", title: "Eclipses", text: "While the world feared mythological dragons swallowing the sun, Indian texts explicitly documented eclipses mathematically as pure planetary shadows." },
            { icon: "ph-chart-line-up", title: "Fibonacci Sequence", text: "The 'Hemachandra sequence' identified the Fibonacci layout of numbers 50 years prior to Fibonacci, derived intuitively from Sanskrit poetic meters." },
            { icon: "ph-snowflake", title: "Ice Making", text: "By manipulating evaporation and specialized porous clay geometries, ancients successfully manufactured ice in desert climates directly under the blazing sun." }
        ],
        [
            { icon: "ph-map-trifold", title: "Meridian Line", text: "The prime meridian of ancient global astronomy passed straight through the city of Ujjain, essentially acting as the Greenwich of the ancient world." },
            { icon: "ph-book", title: "Grammatical Math", text: "Panini's Sanskrit grammar rules utilized meta-rules, transformations, and recursions explicitly mimicking the structure of modern computer algorithms." },
            { icon: "ph-spiral", title: "Macrocosm", text: "The ancient mandala fundamentally operated as both a spiritual visualization tool and an extraordinarily precise map of shifting universal geometries." }
        ]
    ];

    let currentFactSetIndex = -1;
    let availableFactIndices = [];
    const factContainer = document.getElementById('facts-container');
    const indicator = document.getElementById('fact-set-indicator');
    if (indicator) indicator.style.display = 'none'; // Ensure it's hidden if somehow it is still in DOM
    const refreshBtn = document.getElementById('refresh-facts-btn');

    function renderFactSet(index, animate) {
        if (!factContainer) return;
        const set = factSets[index];

        const updateContent = () => {
            for (let i = 0; i < 3; i++) {
                const front = document.getElementById(`fact-front-${i}`);
                const back = document.getElementById(`fact-back-${i}`);
                if (front && back && set[i]) {
                    front.innerHTML = `
                        <i class="ph ${set[i].icon} orange-glow"></i>
                        <h3>${set[i].title}</h3>
                        <p>Hover to reveal</p>
                    `;
                    back.innerHTML = `
                        <p>${set[i].text}</p>
                    `;
                }
            }
        };

        if (animate) {
            factContainer.style.animation = 'none';
            void factContainer.offsetWidth; // Trigger reflow
            factContainer.style.animation = 'factFadeOut 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards';
            
            setTimeout(() => {
                updateContent();
                factContainer.style.animation = 'none';
                void factContainer.offsetWidth;
                factContainer.style.animation = 'factFadeIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards';
            }, 400);
        } else {
            updateContent();
        }
    }

    function getNextFactSetIndex() {
        if (availableFactIndices.length === 0) {
            // Refill the array with all index options
            availableFactIndices = Array.from({length: factSets.length}, (_, i) => i);
            
            // Fisher-Yates Shuffle
            for (let i = availableFactIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableFactIndices[i], availableFactIndices[j]] = [availableFactIndices[j], availableFactIndices[i]];
            }
            
            // Make sure we never immediately repeat the very last element of the previous loop
            if (availableFactIndices[availableFactIndices.length - 1] === currentFactSetIndex && availableFactIndices.length > 1) {
                // Swap it down
                [availableFactIndices[availableFactIndices.length - 1], availableFactIndices[0]] = [availableFactIndices[0], availableFactIndices[availableFactIndices.length - 1]];
            }
        }
        return availableFactIndices.pop(); // Pop from end
    }

    function loadFactSetQueue(animate = true) {
        currentFactSetIndex = getNextFactSetIndex();
        renderFactSet(currentFactSetIndex, animate);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                icon.style.transform = `rotate(${Math.random() * 180 + 360}deg)`;
            }
            loadFactSetQueue(true);
        });
    }

    // Auto-load a random queue-based set on page load instantly
    loadFactSetQueue(false);

});
