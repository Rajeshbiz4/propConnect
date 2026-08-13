import { Bath, BedDouble, MapPin, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

function money(value) {
  return value
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : 'Price on request';
}

export default function PropertyCard({ property, publicSlug }) {
  const cover = property.images?.find((image) => image.isCover) || property.images?.[0];
  const price = property.purpose === 'sale' ? property.sellingPrice : property.monthlyRent;
  const detailUrl = publicSlug
    ? ROUTES.publicProperty(publicSlug, property._id)
    : ROUTES.editProperty(property._id);

  return (
    <article className="property-card">
      <Link to={detailUrl} className="property-image-wrap" aria-label={`Open ${property.title}`}>
        {cover
          ? <img src={cover.thumbnailUrl || cover.url} alt={property.title} className="property-image" loading="lazy" />
          : <div className="property-placeholder">No photo</div>}
        <span className={`status-pill status-${property.status}`}>{property.status?.replaceAll('-', ' ')}</span>
      </Link>
      <div className="property-card-body">
        <div className="property-price">{money(price)}{property.purpose === 'rent' && price ? <small>/month</small> : null}</div>
        <Link to={detailUrl} className="property-title">{property.title}</Link>
        <p className="muted"><MapPin size={15} /> {[property.address?.area, property.address?.city].filter(Boolean).join(', ') || 'Location not added'}</p>
        <div className="property-meta">
          {property.bhk && <span><BedDouble size={16} />{property.bhk}</span>}
          {property.carpetArea ? <span><Maximize2 size={16} />{property.carpetArea} {property.areaUnit}</span> : null}
          {property.propertyType === 'flat' && <span><Bath size={16} />{property.furnishing || 'Flat'}</span>}
        </div>
      </div>
    </article>
  );
}
