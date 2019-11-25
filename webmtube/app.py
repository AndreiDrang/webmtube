import logging
import logging.config

import falcon
from falcon_cors import CORS
from sqlalchemy import create_engine

from webmtube import config
logging.config.dictConfig(config.LOGGING) # prepare logger firstly

from webmtube.middleware import RequireJSON, JSONTranslator
from webmtube.models import *
from webmtube.views import ScreamerResource, ViewWEBMResource, LikeResource, DislikeResource


logger = logging.getLogger(__name__)


cors = CORS(allow_all_origins=True, allow_all_headers=True, allow_all_methods=True)

# Resources for API
screamer_resource = ScreamerResource()
view_webm_resource = ViewWEBMResource()
like_resource = LikeResource()
dislike_resource = DislikeResource()

# Callable WSGI app
api = falcon.API(middleware=[cors.middleware, RequireJSON(), JSONTranslator()])

# Routing
api.add_route('/check', screamer_resource)
api.add_route('/check/{md5}/view', view_webm_resource)
api.add_route('/check/{md5}/like', like_resource)
api.add_route('/check/{md5}/dislike', dislike_resource)

logger.debug("App runned created")
