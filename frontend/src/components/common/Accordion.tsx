import React from "react";

interface AccordionProps {
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Accordion = ({
  expanded,
  onChange,
  children,
  className = "",
  id,
}: AccordionProps) => {
  return (
    <div
      id={id}
      className={`border border-gray-200 rounded-lg overflow-hidden mb-2 bg-white ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            expanded,
            onChange,
          });
        }
        return child;
      })}
    </div>
  );
};

interface AccordionSummaryProps {
  children: React.ReactNode;
  expandIcon?: React.ReactNode;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  className?: string;
  id?: string;
}

export const AccordionSummary = ({
  children,
  expandIcon,
  expanded,
  onChange,
  className = "",
  id,
}: AccordionSummaryProps) => {
  const handleClick = (event: React.MouseEvent) => {
    if (onChange) {
      onChange(event, !expanded);
    }
  };

  return (
    <div
      id={id}
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={handleClick}
    >
      <div className="flex-1">{children}</div>
      {expandIcon && (
        <div
          className={`transition-transform duration-0 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          {expandIcon}
        </div>
      )}
    </div>
  );
};

interface AccordionDetailsProps {
  children: React.ReactNode;
  expanded?: boolean;
  className?: string;
}

export const AccordionDetails = ({
  children,
  expanded,
  className = "",
}: AccordionDetailsProps) => {
  if (!expanded) return null;

  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
