import * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRepeat, ChevronDown, ChevronRight, Folder2, Globe2 } from 'react-bootstrap-icons';
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';

import './../assets/page.css';

export function Page() {
	const [data, setData] = useState(null);
	const [isPageLoading, setIsPageLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = () => {
		setIsPageLoading(true);
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
				setIsPageLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching data: ', error.message);
			});
	};

	const displayPage = (page) => (
		<div key={page.url}>
			{page.subpages && page.subpages.length > 0 ? (
				<>
					<span className="toggle element" onClick={() => toggleSubpages(page.url)}>
						{page.isSubpagesOpen ? <ChevronDown className="icon" /> : <ChevronRight className="icon" />}
						<Folder2 className="icon" />
						{page.url}
					</span>
					<div className="subpages" style={{ display: page.isSubpagesOpen ? 'block' : 'none' }}>
						{page.subpages.map((subpage) => displayPage(subpage))}
					</div>
				</>
			) : (
				<span className="element">
					<Globe2 className="icon" />
					{page.url}
				</span>
			)}
		</div>
	);

	const toggleSubpages = (url) => {
		const toggleSubpagesRecursive = (pages) => {
			return pages.map((page) => {
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
		<article id="page">
			<div className="title">
				<h3>Dirb</h3>
				<span id="time">
					12min
					<ArrowRepeat className="refresh" />
				</span>
			</div>
			{!isPageLoading ? (
				<div>{data.pages.map((page) => displayPage(page))}</div>
			) : (
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
			)}
		</article>
	);
}
