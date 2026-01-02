import { NextResponse } from 'next/server';

export async function GET() {
    const embedScript = `
(function() {
    const scriptTag = document.currentScript || document.querySelector('script[data-webring]');
    if (!scriptTag) return;
    
    const userId = scriptTag.getAttribute('data-user') || '';
    const embedColor = scriptTag.getAttribute('data-color') || 'black';
    const embedArrow = scriptTag.getAttribute('data-arrow') || 'arrow';
    const embedCustomColor = scriptTag.getAttribute('data-custom-color') || '';
    
    const baseUrl = '${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.uwaterloo.network'}';
    
    // Fetch connections for this user (or all members if no user specified)
    const apiUrl = userId ? baseUrl + '/api/webring?user=' + userId : baseUrl + '/api/webring';
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const container = document.createElement('div');
            container.id = 'uwaterloo-webring';
            container.style.cssText = \`
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f9f9f9;
                border-radius: 12px;
                border: 2px solid #e0e0e0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                transition: all 0.3s ease;
            \`;
            
            const arrowColor = getArrowColor(embedColor, embedCustomColor);
            
            // Left arrow - navigate to previous connection
            const leftArrow = document.createElement('button');
            leftArrow.innerHTML = getArrowIcon('left', embedArrow);
            leftArrow.style.cssText = \`
                border: none;
                background: transparent;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.2s;
                font-size: 24px;
                padding: 0;
                line-height: 1;
                color: \${arrowColor};
            \`;
            leftArrow.onmouseover = () => leftArrow.style.opacity = '0.7';
            leftArrow.onmouseout = () => leftArrow.style.opacity = '1';
            
            // Center icon - links to the webring homepage
            const centerLink = document.createElement('a');
            centerLink.href = baseUrl;
            centerLink.target = '_blank';
            centerLink.rel = 'noopener noreferrer';
            centerLink.title = 'Visit uwaterloo.network';
            centerLink.style.cssText = \`
                display: flex;
                transition: transform 0.2s;
            \`;
            centerLink.onmouseover = () => centerLink.style.transform = 'scale(1.1)';
            centerLink.onmouseout = () => centerLink.style.transform = 'scale(1)';
            
            if (embedColor === 'custom' && embedCustomColor) {
                const iconWrapper = document.createElement('div');
                iconWrapper.style.cssText = \`
                    width: 56px;
                    height: 56px;
                    background-color: \${embedCustomColor};
                    mask: url(\${baseUrl}/icon.svg) center/contain no-repeat;
                    -webkit-mask: url(\${baseUrl}/icon.svg) center/contain no-repeat;
                \`;
                centerLink.appendChild(iconWrapper);
            } else {
                const colorMap = {
                    'black': '/icon.svg',
                    'red': '/iconred.svg',
                    'yellow': '/iconyellow.svg',
                    'white': '/iconwhite.svg'
                };
                const iconSrc = baseUrl + (colorMap[embedColor] || colorMap['black']);
                
                const icon = document.createElement('img');
                icon.src = iconSrc;
                icon.alt = 'UWaterloo Webring';
                icon.style.cssText = \`
                    width: 56px;
                    height: 56px;
                    display: block;
                \`;
                centerLink.appendChild(icon);
            }
            
            // Right arrow - navigate to next connection
            const rightArrow = document.createElement('button');
            rightArrow.innerHTML = getArrowIcon('right', embedArrow);
            rightArrow.style.cssText = \`
                border: none;
                background: transparent;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.2s;
                font-size: 24px;
                padding: 0;
                line-height: 1;
                color: \${arrowColor};
            \`;
            rightArrow.onmouseover = () => rightArrow.style.opacity = '0.7';
            rightArrow.onmouseout = () => rightArrow.style.opacity = '1';
            
            // If there are members to navigate through
            if (data.members && data.members.length > 0) {
                let currentIndex = Math.floor(Math.random() * data.members.length);
                
                leftArrow.onclick = () => {
                    currentIndex = (currentIndex - 1 + data.members.length) % data.members.length;
                    navigateToMember(data.members[currentIndex]);
                };
                
                rightArrow.onclick = () => {
                    currentIndex = (currentIndex + 1) % data.members.length;
                    navigateToMember(data.members[currentIndex]);
                };
                
                function navigateToMember(member) {
                    window.open(member.website, '_blank');
                }
            } else {
                // No connections - hide arrows or make them link to webring
                leftArrow.style.opacity = '0.3';
                leftArrow.style.cursor = 'default';
                rightArrow.style.opacity = '0.3';
                rightArrow.style.cursor = 'default';
            }
            
            function getArrowIcon(direction, style) {
                const arrows = {
                    arrow: direction === 'left' ? '←' : '→',
                    chevron: direction === 'left' ? '‹' : '›',
                    angle: direction === 'left' ? '〈' : '〉'
                };
                return arrows[style] || arrows.arrow;
            }
            
            function getArrowColor(color, customColor) {
                if (color === 'custom' && customColor) {
                    return customColor;
                }
                const colorMap = {
                    'black': '#000000',
                    'red': '#ba0e34',
                    'yellow': '#ffd54f',
                    'white': '#ffffff'
                };
                return colorMap[color] || '#000000';
            }
            
            container.appendChild(leftArrow);
            container.appendChild(centerLink);
            container.appendChild(rightArrow);
            
            scriptTag.parentNode.insertBefore(container, scriptTag.nextSibling);
        })
        .catch(err => {
            console.error('Webring error:', err);
        });
})();
`;

    return new NextResponse(embedScript, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    });
}

// Handle preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
    });
}
