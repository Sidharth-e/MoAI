import Link from "next/link";
import { FiPlus } from "react-icons/fi";

const NewChat: React.FC = () => (
  <button className="p-2 m-4 bg-blue-500 text-white rounded">
            <Link
              href="#"

            >
              <FiPlus size={24} />
            </Link>
  </button>
);

export default NewChat;