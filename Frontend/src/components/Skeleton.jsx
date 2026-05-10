const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
};

export const BookCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
    <Skeleton className="h-48 w-full mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;