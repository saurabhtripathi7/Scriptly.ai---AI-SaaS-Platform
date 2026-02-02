import { useState } from "react";
import Markdown from "react-markdown";

/**
 * CreationItem
 * -------------
 * Renders a single AI-generated creation (script, title, description, image, etc.)
 * Used inside the Dashboard to display user's past generations.
 *
 * Props:
 * - item: {
 *     prompt: string        -> user input used to generate content
 *     type: string          -> type of creation (script, title, image, etc.)
 *     content: string       -> generated AI output
 *     created_at: timestamp -> when the creation was made
 *   }
 */

const CreationItem = ({ item }) => {
  /**
   * Local UI state to control expand / collapse behavior.
   * - false: only header is visible
   * - true : full generated content is shown
  */
  const [expanded, setExpanded] = useState(false);
  
  return (
    /**
     * Entire card is clickable to toggle expanded view.
     * This keeps UX simple: click anywhere to view details.
     */
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">
          {item.type}
        </button>
      </div>
      {expanded && (
        <div>
          {item.type === "image" ? (
            <div>
              <img
                src={item.content}
                alt="image"
                className="mt-3 w-full max-w-md"
              />
            </div>
          ) : (
            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-700">
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;