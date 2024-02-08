import React, { useState, useEffect } from 'react';
import moment from 'moment';

const TimeRounder = ({ initialTimestamp }) => {
	console.log(initialTimestamp);
	const [timeAgo, setTimeAgo] = useState('');

	useEffect(() => {
		const timestamp = parseInt(initialTimestamp);
		const timeAgoString = moment(timestamp).fromNow();
		setTimeAgo(timeAgoString);
	}, [initialTimestamp]);

	return <span>{timeAgo}</span>;
};

export default TimeRounder;
