import { NextResponse } from 'next/server';

export async function GET() {
    const embedScript = `
(function() {
    const scriptTag = document.currentScript || document.querySelector('script[data-user]');
    if (!scriptTag) return;
    
    const userId = scriptTag.getAttribute('data-user');
    if (!userId) return;
    
    const embedColor = scriptTag.getAttribute('data-color') || 'black';
    const embedArrow = scriptTag.getAttribute('data-arrow') || 'arrow';
    const embedCustomColor = scriptTag.getAttribute('data-custom-color') || '';
    
    const baseUrl = '${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}';
    
    fetch(baseUrl + '/api/webring/' + userId)
        .then(res => res.json())
        .then(data => {
            if (!data.friends || data.friends.length === 0) {
                console.warn('Webring: No friends configured');
                return;
            }
            
            data.embedColor = embedColor;
            data.embedArrow = embedArrow;
            data.embedCustomColor = embedCustomColor;
            
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
            
            let currentIndex = 0;
            
            const arrowColor = getArrowColor(data);
            
            const leftArrow = document.createElement('button');
            leftArrow.innerHTML = getArrowIcon('left', data.embedArrow);
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
            leftArrow.onmouseover = () => {
                leftArrow.style.opacity = '0.7';
            };
            leftArrow.onmouseout = () => {
                leftArrow.style.opacity = '1';
            };
            leftArrow.onclick = () => {
                currentIndex = (currentIndex - 1 + data.friends.length) % data.friends.length;
                updateLink();
            };
            
            const centerLink = document.createElement('a');
            centerLink.href = data.friends[0].website;
            centerLink.target = '_blank';
            centerLink.rel = 'noopener noreferrer';
            centerLink.style.cssText = \`
                display: flex;
                transition: transform 0.2s;
            \`;
            centerLink.onmouseover = () => {
                centerLink.style.transform = 'scale(1.1)';
            };
            centerLink.onmouseout = () => {
                centerLink.style.transform = 'scale(1)';
            };
            
            const icon = document.createElement('img');
            let iconSrc = baseUrl + '/icon.svg';
            
            if (data.embedColor === 'custom' && data.embedCustomColor) {
                const iconWrapper = document.createElement('div');
                iconWrapper.style.cssText = \`
                    width: 56px;
                    height: 56px;
                    background-color: \${data.embedCustomColor};
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
                iconSrc = baseUrl + (colorMap[data.embedColor] || colorMap['black']);
                
                icon.src = iconSrc;
                icon.alt = 'Waterloo Webring';
                icon.style.cssText = \`
                    width: 56px;
                    height: 56px;
                    display: block;
                \`;
                centerLink.appendChild(icon);
            }
            
            const rightArrow = document.createElement('button');
            rightArrow.innerHTML = getArrowIcon('right', data.embedArrow);
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
            rightArrow.onmouseover = () => {
                rightArrow.style.opacity = '0.7';
            };
            rightArrow.onmouseout = () => {
                rightArrow.style.opacity = '1';
            };
            rightArrow.onclick = () => {
                currentIndex = (currentIndex + 1) % data.friends.length;
                updateLink();
            };
            
            function updateLink() {
                centerLink.href = data.friends[currentIndex].website;
                centerLink.title = 'Visit ' + (data.friends[currentIndex].name || 'friend');
            }
            
            function getArrowIcon(direction, style) {
                const arrows = {
                    arrow: direction === 'left' ? '←' : '→',
                    chevron: direction === 'left' ? '‹' : '›',
                    angle: direction === 'left' ? '〈' : '〉'
                };
                return arrows[style] || arrows.arrow;
            }
            
            function getArrowColor(data) {
                if (data.embedColor === 'custom' && data.embedCustomColor) {
                    return data.embedCustomColor;
                }
                const colorMap = {
                    'black': '#000000',
                    'red': '#ba0e34',
                    'yellow': '#ffd54f',
                    'white': '#ffffff'
                };
                return colorMap[data.embedColor] || '#000000';
            }
            
            container.appendChild(leftArrow);
            container.appendChild(centerLink);
            container.appendChild(rightArrow);
            
            scriptTag.parentNode.insertBefore(container, scriptTag.nextSibling);
            
            updateLink();
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
        },
    });
}

