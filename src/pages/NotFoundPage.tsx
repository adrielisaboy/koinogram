import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { BrandMark } from '../components/Brand';

export function NotFoundPage() {
  return <main className="not-found-page"><header><BrandMark /></header><section><span className="not-found-mark"><Compass size={24} /></span><span className="eyebrow">A SMALL DETOUR</span><h1>This path doesn’t lead anywhere.</h1><p>The page may have moved. Your people are still just a step away.</p><div><Link to="/" className="button button-outline"><ArrowLeft size={15} /> Back to Koinogram</Link><Link to="/app" className="button button-primary">Explore the demo</Link></div></section><footer>Koinogram <span>·</span> There’s room for you here.</footer></main>;
}
