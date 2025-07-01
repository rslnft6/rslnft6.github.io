import dynamic from 'next/dynamic';
const DevPanel = dynamic(() => import('../components/DevPanel'), { ssr: false });
export default function DevPanelPage() {
  return <div style={{padding:40,maxWidth:900,margin:'auto'}}><DevPanel /></div>;
}
