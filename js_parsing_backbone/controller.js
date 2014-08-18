/////////////////////////////////////////////////////////////////////////////////////
// This is the main script file for http://globalcreativitynetwork.net. It controls
// data parsing, and builds models and views of the navigation and the descriptions
// associated with them. This script helps me maintain the content for the navigation
// which is repeated on all six pages.
/////////////////////////////////////////////////////////////////////////////////////

window.controller = window.controller || {};

(function(ns){

	// Variable to ferry events between views
	ns.event_bus = _({}).extend(Backbone.Events);

	// When DOM is loaded, pull the xml
	ns.documentReady = function(){
		ns.pullXML();
		// console.log('ready');
	};

	// Finds xml for data parsing
	ns.pullXML = function(){
		var xml = $.ajax({
			type: "GET",
			url: "xml/navigation.xml",
			dataType: "xml",
			success: ns.parseData
		});
	};

	// two separate functions for different types of data
	ns.parseData = function(xml){
		// console.log(xml);
		ns.parseMenu(xml);

		ns.parseDescription(xml);
		// console.log('starting parse');

	};

	// Grab data to build the navigation menu with
	ns.parseMenu = function(xml){
		// console.log(xml);
		var navXML = xml.firstChild;
		var $navXML = $(navXML);
		var menu = $navXML.children('menu');
		var item = $(menu).children('item');

		ns.menuArray = [];

		$(item).each(function(){
			var itemObject = {};
			var itemXML = $(this)[0];
			itemObject.text = $(itemXML).text();
			itemObject.id = $(itemXML).attr('id');
			ns.menuArray.push(itemObject);
		});

		ns.createNavMenu(ns.menuArray);
		// console.log('menu parsed');

	};

	// build Models and views for individual menu items in the nav
	ns.NavMenuItemModel = Backbone.Model.extend({
		defaults: {

		}
	});
	ns.NavMenuItemView = Backbone.View.extend({
		
		className: 'col-1-5',
		tagName: 'li',

		events: {
			'click': 'revealSection'
		},

		initialize: function(){
		},

		render: function(){

			var template = $('#navItem').html();

			var html = _.template(template, this.model.get('menuItem'));

			this.$el.html(html);

			return this.$el;

		},

		// Sends event out for another view to respond
		revealSection: function(event){
	    	event.preventDefault();
	    	var nav = $(this.$el).find('a');
	    	var nav_id = nav.attr('id').split('_', 2);
			ns.event_bus.trigger('revealSelection', [nav_id]);
		}

	});

	// loops through the data and renders out navigation to the DOM
	ns.createNavMenu = function(data){
		// console.log(data);
		for (var i = 0; i < data.length; i++){
			var menuItem = data[i];
			var menuItemModel = new ns.NavMenuItemModel({
				'menuItem': menuItem
			});

			var menuItemView = new ns.NavMenuItemView({
				model: menuItemModel
			});

			$('#header-nav > ul').append(menuItemView.render());
			console.log('menu created');
		}

	};

	// parses xml for description data, to supplement navigation
	ns.parseDescription = function(xml){

		var navXML = xml.firstChild;
		var $navXML = $(navXML);

		var descriptions = $navXML.children('descriptions');
		var item = $(descriptions).children('item');

		ns.descriptionsArray = [];

		$(item).each(function(){
			var descriptionItem = {};
			var descriptionXML = $(this)[0];
			descriptionItem.className = $(descriptionXML).attr('className');
			descriptionItem.title = $(descriptionXML).children('title').text();
			descriptionItem.link = $(descriptionXML).children('link').text();
			descriptionItem.text = $(descriptionXML).children('paragraph').text();
			ns.descriptionsArray.push(descriptionItem);
		});
		ns.createDescriptions(ns.descriptionsArray);
	};

	// Define description model and view
	ns.DescriptionsModel = Backbone.Model.extend({
		defaults: {}
	});
	ns.DescriptionsView = Backbone.View.extend({
		className: 'widget clearfix',

		events: {},

		initialize: function(){
			// sets event listener on custom event 'revealSelection'
			this.listenTo(ns.event_bus, 'revealSelection', this.expandView);
		},

		render: function(){
			var template = $('#navDescription').html();
			var html = _.template(template, this.model.get('descriptionItem'));
			this.$el.html(html);
			return this.$el;
		},

		// listens to event_bus and responds to 'revealSelection' custom event
		expandView: function(event){
	    	this.$el.each(function(){
	    		var excerptClass = $(this).children('div:first').attr('class').split("_", 2);
	    		var nav_data = event[0];
	    		var nav_id = nav_data[1];
	    		if( nav_id == excerptClass[1] ){

	    			if($(this).hasClass('selected')){
	    			 	// do nothing
	    			}
	    			else{
	    				$('.selected').slideUp().removeClass('selected');
	                	$(this).addClass('selected').slideDown(scrollTo());
	            	}
	    		}
	    	});
		}

	});

	// loops through description data and creates views to correspond to the navigation items
	ns.createDescriptions = function(data){
		for (var i = 0; i < data.length; i++){
			var descriptionItem = data[i];
			// console.log(descriptionItem);
			var descriptionItemModel = new ns.DescriptionsModel({
				'descriptionItem': descriptionItem
			});
			var descriptionItemView = new ns.DescriptionsView({
				model: descriptionItemModel
			});
			$('#excerpts').append(descriptionItemView.render());
		};
		$('.exit').each(function(){
			$(this).on('click', ns.closeSection);
		});
	};

	// closes the currently opened description
	ns.closeSection = function(e){
		var excerpts = $('#excerpts');
		excerpts.find('.selected').removeClass('selected').slideUp();
	};

})(window.controller);