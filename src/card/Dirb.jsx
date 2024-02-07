import * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRepeat, ChevronDown, ChevronRight, Folder2, Globe2 } from 'react-bootstrap-icons';
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';

import './../assets/dirb.css';

export function Dirb() {
	const [data, setData] = useState(null);
	const [dirbStatus, setDirbStatus] = useState('loading');

	const [dribTryTime, setDribTryTime] = useState('2min 30s');

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = () => {
		setDirbStatus('loading');
		fetch('http://192.168.0.79:1000/json')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				const openAllSubpagesRecursive = (pages) => {
					return pages.map((page) => {
						const updatedSubpages = page.subpages ? openAllSubpagesRecursive(page.subpages) : [];
						return {
							...page,
							isSubpagesOpen: true,
							subpages: updatedSubpages,
						};
					});
				};

				const dataWithOpenSubpages = openAllSubpagesRecursive(data.pages);
				setData({ ...data, pages: dataWithOpenSubpages });
				setDirbStatus('show');
			})
			.catch((error) => {
				setDirbStatus('error');
				console.error('Error fetching data: ', error);
			});
	};

	const displayPage = (dirb) => (
		<div key={dirb.url}>
			{dirb.subpages && dirb.subpages.length > 0 ? (
				<>
					<span className="toggle element" onClick={() => toggleSubpages(dirb.url)}>
						{dirb.isSubpagesOpen ? <ChevronDown className="icon" /> : <ChevronRight className="icon" />}
						<Folder2 className="icon" />
						{dirb.url}
					</span>
					<div className="subpages" style={{ display: dirb.isSubpagesOpen ? 'block' : 'none' }}>
						{dirb.subpages.map((subpage) => displayPage(subpage))}
					</div>
				</>
			) : (
				<span className="element">
					<Globe2 className="icon" />
					{dirb.url}
				</span>
			)}
		</div>
	);

	const toggleSubpages = (url) => {
		const toggleSubpagesRecursive = (dirbs) => {
			return dirbs.map((page) => {
				if (page.url === url) {
					return { ...page, isSubpagesOpen: !page.isSubpagesOpen };
				} else if (page.subpages && page.subpages.length > 0) {
					const updatedSubpages = toggleSubpagesRecursive(page.subpages);
					return { ...page, subpages: updatedSubpages };
				} else {
					return page;
				}
			});
		};

		setData((prevData) => {
			if (!prevData || !prevData.pages) {
				return prevData;
			}

			const updatedPages = toggleSubpagesRecursive(prevData.pages);
			return { ...prevData, pages: updatedPages };
		});
	};

	return (
		<article id="dirb">
			<div className="title">
				<h3>Dirb</h3>
				<span id="time">
					12min
					<ArrowRepeat className="refresh" />
				</span>
			</div>
			{dirbStatus !== 'loading' && dirbStatus !== 'error' ? (
				<div>{data.pages.map((page) => displayPage(page))}</div>
			) : dirbStatus === 'loading' ? (
				<div className="pageLoading">
					<CircularProgress
						variant="indeterminate"
						disableShrink
						sx={{
							color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
							animationDuration: '550ms',
							[`& .${circularProgressClasses.circle}`]: {
								strokeLinecap: 'round',
							},
						}}
						size={40}
						thickness={4}
					/>
				</div>
			) : (
				<div className="error">
					<p>
						An error occurred. Retry in <span>{dribTryTime}</span>
					</p>
				</div>
			)}
		</article>
	);
}
