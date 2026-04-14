export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex items-center justify-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} AY Asemota. All rights reserved.</p>
      </div>
    </footer>
  );
}
