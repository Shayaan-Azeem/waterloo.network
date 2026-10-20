const campusNetworks = [
    { school: 'UT Austin', name: 'utexas.network', url: 'https://www.utexas.network/' },
    { school: 'Cornell', name: 'bigred.network', url: 'https://www.bigred.network/' },
    { school: 'University of Guelph', name: 'uguelph.network', url: 'https://www.uguelph.network/' },
    { school: 'Columbia', name: 'columbia.network', url: 'https://www.columbia.network/' },
    { school: 'University of Houston', name: 'uhouston.network', url: 'https://www.uhouston.network/' },
    { school: 'University of Mary Washington', name: 'umw.network', url: 'https://www.umw.network/' },
    { school: 'NYU', name: 'nyuniversity.network', url: 'https://www.nyuniversity.network/' },
    { school: 'NESCAC schools', name: 'nescac.network', url: 'https://www.nescac.network/' },
    { school: 'BRAC University', name: 'bracu.network', url: 'https://bracu-network.vercel.app/' },
    { school: 'Vistula University', name: 'vistula.network', url: 'https://vistula-network.com/' },
    { school: 'Arizona State', name: 'asunetwork.com', url: 'https://asunetwork.com/' },
    { school: 'University of Toronto', name: 'northblue.network', url: 'https://www.northblue.network/' },
];

export default function CampusNetworks() {
    return (
        <details className="campus-networks" id="campus-networks">
            <summary>friends elsewhere</summary>
            <ul className="campus-networks-list">
                {campusNetworks.map(network => (
                    <li key={network.url}>
                        <a
                            href={network.url}
                            title={network.school}
                            aria-label={`${network.name} — ${network.school}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {network.name}
                        </a>
                    </li>
                ))}
            </ul>
        </details>
    );
}
