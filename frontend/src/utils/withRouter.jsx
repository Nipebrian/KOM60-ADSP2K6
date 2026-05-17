
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function WrappedComponent(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    return <Component {...props} navigate={navigate} params={params} location={location} />;
  }
  WrappedComponent.displayName = `withRouter(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
