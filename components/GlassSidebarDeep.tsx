import React, { useState } from 'react';
import { FaChartBar, FaPlus, FaUsers, FaUserPlus, FaUserEdit, FaUserShield, FaBullhorn, FaHome, FaBuilding, FaIndustry, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SIDEBAR_SECTIONS = [
	{
		key: 'dashboard',
		label: 'لوحة الإحصائيات',
		icon: <FaChartBar size={22} />,
		children: [],
	},
	{
		key: 'units',
		label: 'الوحدات',
		icon: <FaHome size={22} />,
		children: [
			{ key: 'all-units', label: 'كل الوحدات', icon: <FaHome size={18} /> },
			{ key: 'add-unit', label: 'إضافة وحدة', icon: <FaPlus size={18} /> },
			{ key: 'units-analytics', label: 'تحليلات الوحدات', icon: <FaChartBar size={18} /> },
		],
	},
	{
		key: 'employees',
		label: 'الموظفون',
		icon: <FaUsers size={22} />,
		children: [
			{ key: 'all-employees', label: 'كل الموظفين', icon: <FaUsers size={18} /> },
			{ key: 'add-employee', label: 'إضافة موظف', icon: <FaUserPlus size={18} /> },
			{ key: 'roles', label: 'الصلاحيات', icon: <FaUserShield size={18} /> },
			{ key: 'employees-analytics', label: 'تحليلات الموظفين', icon: <FaChartBar size={18} /> },
		],
	},
	{
		key: 'developers',
		label: 'المطورون',
		icon: <FaIndustry size={22} />,
		children: [
			{ key: 'all-developers', label: 'كل المطورين', icon: <FaIndustry size={18} /> },
			{ key: 'add-developer', label: 'إضافة مطور', icon: <FaPlus size={18} /> },
		],
	},
	{
		key: 'compounds',
		label: 'الكمباوندات',
		icon: <FaBuilding size={22} />,
		children: [
			{ key: 'all-compounds', label: 'كل الكمباوندات', icon: <FaBuilding size={18} /> },
			{ key: 'add-compound', label: 'إضافة كمباوند', icon: <FaPlus size={18} /> },
		],
	},
	{
		key: 'ads',
		label: 'الإعلانات',
		icon: <FaBullhorn size={22} />,
		children: [
			{ key: 'all-ads', label: 'كل الإعلانات', icon: <FaBullhorn size={18} /> },
			{ key: 'add-ad', label: 'إضافة إعلان', icon: <FaPlus size={18} /> },
		],
	},
];

const GlassSidebarDeep: React.FC<{ section: string; setSection: (s: string) => void }> = ({ section, setSection }) => {
	const [open, setOpen] = useState<string | null>(null);
	return (
		<aside
			style={{
				minHeight: '100vh',
				width: 180, // تكبير العرض
				background: 'rgba(255,255,255,0.22)',
				backdropFilter: 'blur(20px)',
				borderRight: '2px solid rgba(0,188,212,0.12)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				padding: '32px 0',
				position: 'fixed',
				top: 0,
				right: 0,
				zIndex: 1000,
				boxShadow: '0 4px 32px #00bcd422',
				borderRadius: '0 0 32px 32px',
			}}
		>
			{SIDEBAR_SECTIONS.map((s) => (
				<div key={s.key} style={{ width: '100%' }}>
					<button
						onClick={() => (s.children.length ? setOpen(open === s.key ? null : s.key) : setSection(s.key))}
						style={{
							background: section === s.key ? 'rgba(0,188,212,0.18)' : 'transparent',
							border: 'none',
							borderRadius: 16,
							margin: '12px 0',
							padding: 12,
							cursor: 'pointer',
							boxShadow: section === s.key ? '0 2px 12px #00bcd455' : 'none',
							transition: 'all 0.2s',
							color: section === s.key ? '#00bcd4' : '#333',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							width: '100%',
						}}
						title={s.label}
					>
						{s.icon}
						<span style={{ fontSize: 12, marginTop: 4 }}>{s.label}</span>
						{s.children.length ? (open === s.key ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />) : null}
					</button>
					{open === s.key && s.children.length > 0 && (
						<div style={{ width: '100%', paddingRight: 8 }}>
							{s.children.map((child) => (
								<button
									key={child.key}
									onClick={() => setSection(child.key)}
									style={{
										background: section === child.key ? 'rgba(0,188,212,0.18)' : 'transparent',
										border: 'none',
										borderRadius: 12,
										margin: '6px 0',
										padding: 8,
										cursor: 'pointer',
										color: section === child.key ? '#00bcd4' : '#333',
										display: 'flex',
										alignItems: 'center',
										gap: 6,
										width: '100%',
										fontSize: 13,
									}}
									title={child.label}
								>
									{child.icon}
									<span>{child.label}</span>
								</button>
							))}
						</div>
					)}
				</div>
			))}
		</aside>
	);
};

export default GlassSidebarDeep;
