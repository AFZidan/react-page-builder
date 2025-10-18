import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import DynamicIcon from "./components/DynamicIcon";
import FormWithValidation from "./components/FormWithValidation";

// Render a single component based on type (recursive for nested components)
function RenderComponent({ component }) {
  const { type, content, href, className, children, width, height } = component;

  switch (type) {
    case 'heading':
      return <h2 className={className || "text-3xl font-bold mb-4"}>{content}</h2>;
    case 'text':
      return (
        <div className={className || "text-gray-600 mb-4"}>
          <ReactMarkdown className="prose prose-sm max-w-none">
            {content}
          </ReactMarkdown>
        </div>
      );
    case 'button':
      return (
        <a href={href || "#"} className={className || "btn btn-primary"}>
          {content}
        </a>
      );
    case 'image':
      return (
        <img 
          src={content} 
          alt="" 
          className={className || "w-full h-auto"}
          style={{
            width: width !== 'auto' ? width : undefined,
            height: height !== 'auto' ? height : undefined,
          }}
        />
      );
    case 'divider':
      return <div className={className || "divider my-8"}></div>;
    case 'spacer':
      return <div className={className || "h-12"}></div>;
    case 'columns':
      return (
        <div className={className || "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"}>
          {children && children.map((child) => (
            <RenderComponent key={child.id} component={child} />
          ))}
        </div>
      );
    case 'container':
      return (
        <div className={className || "p-4 mb-4"}>
          {children && children.map((child) => (
            <RenderComponent key={child.id} component={child} />
          ))}
        </div>
      );
    case 'html':
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    case 'icon':
      if (component.iconLibrary === 'custom') {
        return <div dangerouslySetInnerHTML={{ __html: component.customSvg }} />;
      }
      return <DynamicIcon {...component} />;
    case 'embed':
      return (
        <div 
          className={className}
          style={{ width, height }}
          dangerouslySetInnerHTML={{ __html: component.embedCode }}
        />
      );
    case 'form-container':
      return (
        <FormWithValidation component={component}>
          {children && children.map((child) => (
            <RenderComponent key={child.id} component={child} />
          ))}
        </FormWithValidation>
      );
    case 'form-input':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          <input
            type={component.inputType || 'text'}
            name={component.name}
            placeholder={component.placeholder}
            required={component.required}
            className={className || "input input-bordered w-full"}
          />
        </div>
      );
    case 'form-textarea':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          <textarea
            name={component.name}
            placeholder={component.placeholder}
            required={component.required}
            rows={component.rows || 4}
            className={className || "textarea textarea-bordered w-full"}
          />
        </div>
      );
    case 'form-select':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          <select
            name={component.name}
            required={component.required}
            className={className || "select select-bordered w-full"}
          >
            <option value="">Select...</option>
            {component.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    case 'form-checkbox':
      return (
        <div className="form-control mb-4">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              name={component.name}
              required={component.required}
              className={className || "checkbox"}
            />
            <span className="label-text">{component.label}</span>
          </label>
        </div>
      );
    case 'form-radio-group':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          {component.options?.map((opt, idx) => (
            <label key={idx} className="label cursor-pointer justify-start gap-2">
              <input
                type="radio"
                name={component.name}
                value={opt}
                className="radio"
                required={component.required && idx === 0}
              />
              <span className="label-text">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'form-file':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          <input
            type="file"
            name={component.name}
            accept={component.accept}
            required={component.required}
            className={className || "file-input file-input-bordered w-full"}
          />
        </div>
      );
    case 'form-date':
      return (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">{component.label}</span>
            {component.required && <span className="text-error">*</span>}
          </label>
          <input
            type="date"
            name={component.name}
            required={component.required}
            className={className || "input input-bordered w-full"}
          />
        </div>
      );
    case 'form-submit':
      return (
        <button 
          type="submit" 
          className={className || "btn btn-primary"}
        >
          {content}
        </button>
      );
    default:
      return null;
  }
}

export default function Renderer({ 
  components = [],
  isDraft = false,
  showDraftBanner = true,
  pageName = '',
  pageSlug = ''
}) {
  const [page, setPage] = useState({
    name: pageName,
    slug: pageSlug,
    status: isDraft ? 'DRAFT' : 'PUBLISHED',
    canvasJson: { components }
  });
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!page || components.length === 0) {
    return <div className="container mx-auto px-4 py-12">Page content coming soon.</div>;
  }

  return (
    <div className="min-h-screen py-12">
      {/* Draft Banner */}
      {isDraft && showDraftBanner && (
        <div className="bg-warning text-warning-content py-2 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">DRAFT MODE</span>
              <span className="text-sm">This page is only visible to admins</span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
        {page.description && (
          <p className="text-xl text-gray-600 mb-12">{page.description}</p>
        )}
        <div className="space-y-4">
          {components.map((component) => (
            <RenderComponent key={component.id} component={component} />
          ))}
        </div>
      </div>
    </div>
  );
}


