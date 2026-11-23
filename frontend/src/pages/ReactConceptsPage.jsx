import React, { useState, useRef, useReducer, useEffect, Component } from 'react';
import {
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Send,
  Eye
} from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import { useTheme } from '../context/ThemeContext';

/**
 * =========================================================================
 * ACADEMIC SYLLABUS DEMONSTRATION: CLASS COMPONENT
 * Specifically demonstrates Unit II requirements:
 * - Class component syntax
 * - this.props
 * - this.props.children
 * - Explicit function binding with .bind(this)
 * =========================================================================
 */
class AcademicClassComponentDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clickCount: 0,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Explicit binding as required by React Class Component syllabus
    this.handleClassIncrement = this.handleClassIncrement.bind(this);
  }

  handleClassIncrement() {
    this.setState((prevState) => ({
      clickCount: prevState.clickCount + 1,
      timestamp: new Date().toLocaleTimeString(),
    }));
  }

  render() {
    return (
      <div className="p-4 rounded-xl bg-forest-50/70 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="emerald">Class Component (React.Component)</Badge>
          <span className="text-[11px] text-content-light-secondary font-mono">
            this.state.clickCount: {this.state.clickCount}
          </span>
        </div>

        {/* Demonstrating this.props */}
        <p className="text-xs text-content-light-primary dark:text-content-dark-primary font-medium">
          Received Prop from Parent: <span className="font-mono text-forest-700 dark:text-forest-300">"{this.props.topicTitle}"</span>
        </p>

        {/* Demonstrating this.props.children */}
        <div className="p-2.5 rounded-lg bg-white dark:bg-surface-dark border border-forest-100 dark:border-forest-900 text-xs">
          <span className="text-[10px] uppercase font-bold text-content-light-muted block mb-1">
            Rendered via this.props.children:
          </span>
          {this.props.children}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-content-light-muted">
            Last clicked at: {this.state.timestamp}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={this.handleClassIncrement}
          >
            Increment (calls this.bind method)
          </Button>
        </div>
      </div>
    );
  }
}

/**
 * useReducer demonstration for complex state transition
 */
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, history: [...state.history, `+1 (Count: ${state.count + 1})`] };
    case 'decrement':
      return { count: state.count - 1, history: [...state.history, `-1 (Count: ${state.count - 1})`] };
    case 'reset':
      return { count: 0, history: [...state.history, 'Reset to 0'] };
    default:
      return state;
  }
}

/**
 * Main Interactive React Syllabus Page
 */
export function ReactConceptsPage() {
  const { theme } = useTheme();

  // Unit II: Functional state
  const [activeUnit, setActiveUnit] = useState('unit1');

  // Unit I & III: Expressions & Controlled Component state
  const [controlledInput, setControlledInput] = useState('Interactive React Input');
  const [submittedMessage, setSubmittedMessage] = useState('');

  // Unit III & V: Uncontrolled component with useRef
  const uncontrolledInputRef = useRef(null);
  const [uncontrolledValue, setUncontrolledValue] = useState('');

  // Unit V: useReducer
  const [reducerState, dispatch] = useReducer(counterReducer, { count: 5, history: ['Initial: 5'] });

  // Event handler for controlled form submission
  const handleControlledSubmit = (e) => {
    e.preventDefault(); // SyntheticEvent preventDefault
    setSubmittedMessage(controlledInput);
  };

  const handleUncontrolledRead = () => {
    if (uncontrolledInputRef.current) {
      setUncontrolledValue(uncontrolledInputRef.current.value);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-forest-900 to-forest-800 text-white shadow-forest-md">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <GraduationCap className="w-4 h-4" /> Academic Course Specification
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          React.js Syllabus Concepts Demonstration Hub
        </h1>
        <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-2xl leading-relaxed">
          This interactive page demonstrates every topic required by the course syllabus (Units I through V). Each section contains live, inspectable code constructs.
        </p>
      </div>

      {/* Unit Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-forest-100 dark:border-forest-900/60 text-xs font-medium">
        {[
          { id: 'unit1', label: 'Unit I: JSX & Declarative UI' },
          { id: 'unit2', label: 'Unit II: Components, Props, State & Classes' },
          { id: 'unit3', label: 'Unit III: Synthetic Events & Form Handling' },
          { id: 'unit4', label: 'Unit IV: Routing & Component Tree' },
          { id: 'unit5', label: 'Unit V: Hooks, Reducers & Custom State' },
        ].map((unit) => (
          <button
            key={unit.id}
            onClick={() => setActiveUnit(unit.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeUnit === unit.id
                ? 'bg-forest-700 text-white shadow-sm font-semibold'
                : 'bg-surface-light dark:bg-surface-dark text-content-light-secondary hover:text-content-light-primary border border-forest-100 dark:border-forest-900/60'
            }`}
          >
            {unit.label}
          </button>
        ))}
      </div>

      {/* UNIT I */}
      {activeUnit === 'unit1' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-forest-600" />
                JSX Expressions & Conditional Rendering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-content-light-secondary leading-relaxed">
                JSX allows embedding JavaScript expressions using curly braces <code className="text-forest-700 dark:text-forest-300 font-mono">{"{ ... }"}</code>. React uses a Virtual DOM diffing algorithm to reconcile UI trees declaratively.
              </p>

              <div className="p-3 bg-surface-light-subtle dark:bg-forest-950/40 rounded-xl space-y-2">
                <p className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                  Dynamic Math Expression: 12 × 8 = <span className="font-mono text-emerald-600 font-bold">{12 * 8}</span>
                </p>
                <p className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                  Conditional Rendering (Ternary): Current Theme is{' '}
                  <span className="font-mono text-forest-700 dark:text-forest-300">
                    {theme === 'dark' ? 'Forest Dark Mode 🌙' : 'Forest Light Mode ☀️'}
                  </span>
                </p>
              </div>

              <div>
                <p className="font-semibold mb-1">List Rendering with Unique Keys:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Virtual DOM', 'One-way Data Flow', 'Declarative UI', 'Vite Bundler'].map((topic, i) => (
                    <Badge key={i} variant="forest">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-forest-600" />
                Virtual DOM Reconciliation Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-content-light-secondary leading-relaxed">
              <p>
                In SyncSpace, when multiple users edit simultaneously, Yjs distributes delta updates over WebSockets. React's <strong>Virtual DOM</strong> computes minimal patches and re-renders only the carets and paragraph nodes affected, preserving browser performance.
              </p>
              <div className="p-3 rounded-lg border border-forest-200 dark:border-forest-800 space-y-1 font-mono text-[11px]">
                <div className="text-forest-600">✓ In-Memory VDOM Tree Created</div>
                <div className="text-forest-600">✓ Diffing Algorithm Runs (O(n))</div>
                <div className="text-forest-600">✓ Batch Patch to Real Browser DOM</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* UNIT II */}
      {activeUnit === 'unit2' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-600" />
                Class Component Architecture Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-content-light-secondary leading-relaxed">
                As required by the syllabus, below is an authentic React class component demonstrating <code className="font-mono">this.props</code>, <code className="font-mono">this.props.children</code>, and <code className="font-mono">bind(this)</code>.
              </p>

              {/* Class Component In Action */}
              <AcademicClassComponentDemo topicTitle="SyncSpace Academic Core">
                <p className="text-content-light-secondary italic">
                  "This text was supplied as a child element inside &lt;AcademicClassComponentDemo&gt; and rendered using this.props.children."
                </p>
              </AcademicClassComponentDemo>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Props vs State Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-content-light-secondary">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-light-subtle dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900">
                  <h4 className="font-bold text-content-light-primary dark:text-content-dark-primary mb-1">
                    Props (Properties)
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Passed down from parent</li>
                    <li>Read-only (immutable)</li>
                    <li>Pure unidirectional data flow</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-surface-light-subtle dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900">
                  <h4 className="font-bold text-content-light-primary dark:text-content-dark-primary mb-1">
                    State (useState)
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Managed within component</li>
                    <li>Mutable via setter function</li>
                    <li>Triggers re-render on change</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* UNIT III */}
      {activeUnit === 'unit3' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-forest-600" />
                Controlled Component (Single Source of Truth)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-content-light-secondary leading-relaxed">
                The input value is driven by React component state. Every keystroke triggers a SyntheticEvent that invokes <code className="font-mono">setControlledInput</code>.
              </p>

              <form onSubmit={handleControlledSubmit} className="space-y-3">
                <Input
                  label="Controlled State Value"
                  value={controlledInput}
                  onChange={(e) => setControlledInput(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" icon={Send}>
                  Submit SyntheticEvent Form
                </Button>
              </form>

              {submittedMessage && (
                <div className="p-2.5 rounded-lg bg-forest-50 dark:bg-forest-900/30 text-xs text-forest-800 dark:text-forest-200">
                  Submitted Value: <strong>{submittedMessage}</strong>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-forest-600" />
                Uncontrolled Component (useRef)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-content-light-secondary leading-relaxed">
                In uncontrolled components, the DOM node itself maintains internal state. We access its value using React's <code className="font-mono">useRef()</code> hook without re-rendering on every keystroke.
              </p>

              <div className="space-y-3">
                <input
                  ref={uncontrolledInputRef}
                  defaultValue="Uncontrolled DOM value"
                  className="w-full text-xs sm:text-sm rounded-lg border border-forest-200 dark:border-forest-800 bg-white dark:bg-surface-dark p-2.5 outline-none focus:border-forest-600"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUncontrolledRead}
                >
                  Read DOM Value via ref.current.value
                </Button>
              </div>

              {uncontrolledValue && (
                <div className="p-2.5 rounded-lg bg-surface-light-subtle dark:bg-forest-900/20 text-xs">
                  Value pulled directly from DOM: <strong>{uncontrolledValue}</strong>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* UNIT IV */}
      {activeUnit === 'unit4' && (
        <Card>
          <CardHeader>
            <CardTitle>Unit IV: Routing & React DevTools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-content-light-secondary leading-relaxed">
            <p>
              SyncSpace uses <strong>React Router DOM (v7)</strong> to establish declarative nested routing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-forest-100 dark:border-forest-900">
                <span className="font-bold text-content-light-primary dark:text-content-dark-primary block">
                  useParams()
                </span>
                Extracts dynamic parameters such as <code className="font-mono">:workspaceId</code> and <code className="font-mono">:documentId</code> from the URL path.
              </div>
              <div className="p-3 rounded-lg border border-forest-100 dark:border-forest-900">
                <span className="font-bold text-content-light-primary dark:text-content-dark-primary block">
                  useLocation()
                </span>
                Inspects current route path, search query strings, and state passed through navigation.
              </div>
              <div className="p-3 rounded-lg border border-forest-100 dark:border-forest-900">
                <span className="font-bold text-content-light-primary dark:text-content-dark-primary block">
                  NavLink (isActive)
                </span>
                Applies active navigation styling automatically in the Forest sidebar when the URL matches.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UNIT V */}
      {activeUnit === 'unit5' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-forest-600" />
                State Machine with useReducer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-content-light-secondary leading-relaxed">
                When component state involves multi-step transitions (e.g. revision histories or complex form flows), <code className="font-mono">useReducer</code> guarantees predictable state mutations.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dispatch({ type: 'decrement' })}
                >
                  - Decrement
                </Button>
                <span className="font-mono text-base font-bold text-forest-700 dark:text-forest-300">
                  Count: {reducerState.count}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => dispatch({ type: 'increment' })}
                >
                  + Increment
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dispatch({ type: 'reset' })}
                >
                  Reset
                </Button>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-light-subtle dark:bg-forest-950/40 text-[11px] font-mono max-h-24 overflow-y-auto">
                <span className="font-semibold block text-content-light-primary dark:text-content-dark-primary mb-1">
                  Reducer Action Log:
                </span>
                {reducerState.history.map((entry, idx) => (
                  <div key={idx}>{entry}</div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>React Context API & Custom Hooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-content-light-secondary leading-relaxed">
              <p>
                In SyncSpace, <code className="font-mono">ThemeContext</code> and <code className="font-mono">AuthContext</code> prevent "prop-drilling" across deeply nested component hierarchies.
              </p>
              <div className="p-3 rounded-lg border border-forest-100 dark:border-forest-900 space-y-2">
                <div>
                  <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                    useTheme():
                  </span>{' '}
                  Returns active theme <Badge variant="forest">{theme}</Badge> and toggle functions.
                </div>
                <div>
                  <span className="font-semibold text-content-light-primary dark:text-content-dark-primary">
                    useAuth():
                  </span>{' '}
                  Supplies current logged-in user profile, session tokens, and sign-out capabilities.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ReactConceptsPage;
