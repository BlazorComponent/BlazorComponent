using Microsoft.AspNetCore.Components;

namespace BlazorComponent
{
    public class ComponentAbstractProvider
    {
        private readonly Dictionary<ComponentKey, Type> _typeConfig = new();
        private readonly Dictionary<ComponentKey, Action<AttributesDictionary>> _attributesConfig = new();
        private readonly Dictionary<ComponentKey, IComponentPart> _partsConfig = new();

        public ComponentAbstractProvider Apply(Type type, Type implementType, Action<AttributesDictionary> attributesAction = null)
        {
            var key = new ComponentKey(type);
            if (_typeConfig.TryAdd(key, implementType))
            {
                _attributesConfig[key] = attributesAction;
            }

            return this;
        }

        public ComponentAbstractProvider Apply(Type type, Type implementType, string name, Action<AttributesDictionary> attributesAction = null)
        {
            var key = new ComponentKey(type, name);
            if (_typeConfig.TryAdd(key, implementType))
            {
                _attributesConfig[key] = attributesAction;
            }

            return this;
        }

        public ComponentAbstractProvider Apply<TComponent, TImplementComponent>(Action<AttributesDictionary> attributesAction = null)
            where TImplementComponent : TComponent
        {
            var key = ComponentKey.Get<TComponent>();
            return Apply<TComponent, TImplementComponent>(key, attributesAction);
        }

        private ComponentAbstractProvider Apply<TComponent, TImplementComponent>(ComponentKey key, Action<AttributesDictionary> attributesAction) where TImplementComponent : TComponent
        {
            if (_typeConfig.TryAdd(key, typeof(TImplementComponent)))
            {
                _attributesConfig[key] = attributesAction;
            }

            return this;
        }

        public ComponentAbstractProvider Apply<TComponent, TImplementComponent>(string name, Action<AttributesDictionary> attributesAction = null)
            where TImplementComponent : TComponent
        {
            var key = ComponentKey.Get<TComponent>(name);
            return Apply<TComponent, TImplementComponent>(key, attributesAction);
        }

        /// <summary>
        /// Use this with <see cref="GetMetadata(string)"/>
        /// </summary>
        /// <typeparam name="TComponent"></typeparam>
        /// <param name="name"></param>
        /// <param name="attributesAction"></param>
        /// <returns></returns>
        public ComponentAbstractProvider Apply<TComponent>(string name, Action<AttributesDictionary> attributesAction = null)
            where TComponent : IComponent
        {
            return Apply<IComponent, TComponent>(name, attributesAction);
        }

        public ComponentAbstractProvider Merge<TComponent>(Action<AttributesDictionary> mergeAttributesAction = null)
        {
            var key = ComponentKey.Get<TComponent>();
            Merge(key, mergeAttributesAction);

            return this;
        }

        public ComponentAbstractProvider Merge<TComponent, TImplementComponent>(Action<AttributesDictionary> mergeAttributesAction = null)
            where TImplementComponent : TComponent
        {
            var key = ComponentKey.Get<TComponent>();

            _typeConfig[key] = typeof(TImplementComponent);
            Merge(key, mergeAttributesAction);

            return this;
        }
        
        public ComponentAbstractProvider Merge<TComponent, TImplementComponent>(string name, Action<AttributesDictionary> mergeAttributesAction = null)
            where TImplementComponent : TComponent
        {
            var key = ComponentKey.Get<TComponent>(name);

            _typeConfig[key] = typeof(TImplementComponent);
            Merge(key, mergeAttributesAction);

            return this;
        }

        public ComponentAbstractProvider Merge(Type type, Type implementType, Action<AttributesDictionary> mergeAttributesAction = null)
        {
            var key = new ComponentKey(type);

            _typeConfig[key] = implementType;
            Merge(key, mergeAttributesAction);

            return this;
        }

        private void Merge(ComponentKey key, Action<AttributesDictionary> mergeAttributesAction = null)
        {
            if (mergeAttributesAction != null)
            {
                var attributesAction = _attributesConfig.GetValueOrDefault(key);
                _attributesConfig[key] = attrs =>
                {
                    attributesAction?.Invoke(attrs);
                    mergeAttributesAction?.Invoke(attrs);
                };
            }
        }

        public AbstractMetadata GetMetadata(Type type)
        {
            var key = new ComponentKey(type);
            return GetMetadata(key);
        }

        private AbstractMetadata GetMetadata(ComponentKey key, AttributesDictionary dic = null)
        {
            var implementType = _typeConfig.GetValueOrDefault(key, typeof(EmptyComponent));

            var attributes = dic ?? new AttributesDictionary();
            var action = _attributesConfig.GetValueOrDefault(key);
            action?.Invoke(attributes);

            return new AbstractMetadata(implementType, attributes);
        }

        public AbstractMetadata GetMetadata<TComponent>()
        {
            return GetMetadata(typeof(TComponent));
        }

        public AbstractMetadata GetMetadata<TComponent>(string name)
        {
            var key = ComponentKey.Get<TComponent>(name);
            return GetMetadata(key);
        }

        /// <summary>
        /// Use this with <see cref="Apply{TComponent}(string, Action{Dictionary{string, object}})"/>
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public AbstractMetadata GetMetadata(string name)
        {
            return GetMetadata<IComponent>(name);
        }

        public AbstractMetadata GetMetadata(Type type, int index)
        {
            var key = new ComponentKey(type);
            return GetMetadata(key, new AttributesDictionary(index));
        }

        public AbstractMetadata GetMetadata(Type type, object data = null)
        {
            var key = new ComponentKey(type);

            return GetMetadata(key, new AttributesDictionary(data));
        }

        public AbstractMetadata GetMetadata(Type type, string name, object data = null)
        {
            var key = new ComponentKey(type, name);

            return GetMetadata(key, new AttributesDictionary(data));
        }

        public RenderFragment GetPartContent(Type keyType, IHasProviderComponent component)
        {
            var key = new ComponentKey(keyType);
            return GetPartContent(key, component);
        }

        private RenderFragment GetPartContent(ComponentKey key, IHasProviderComponent component)
        {
            var partType = _typeConfig.GetValueOrDefault(key);
            if (partType == null)
            {
                _partsConfig[key] = null;
                return null;
            }

            //REVIEW: Always create a new obj?
            var obj = Activator.CreateInstance(partType);
            if (obj is IComponentPart componentPart)
            {
                componentPart.Attach(component);
                _partsConfig[key] = componentPart;

                return componentPart.Content;
            }

            throw new InvalidOperationException();
        }

        public RenderFragment GetPartContent(Type keyType, string name, IHasProviderComponent component)
        {
            var key = new ComponentKey(keyType, name);
            return GetPartContent(key, component);
        }

        public RenderFragment GetPartContent(Type keyType, string name, IHasProviderComponent component, Action<AttributesBuilder> builderAction)
        {
            var key = new ComponentKey(keyType, name);
            return GetPartContent(key, component, builderAction);
        }

        public RenderFragment GetPartContent(Type keyType, IHasProviderComponent component, Action<AttributesBuilder> builderAction)
        {
            var key = new ComponentKey(keyType);
            return GetPartContent(key, component, builderAction);
        }

        public RenderFragment GetPartContent(ComponentKey key, IHasProviderComponent component, Action<AttributesBuilder> builderAction)
        {
            //Part has parameters,We may always creat a new obj

            //TODO: change type config
            var partType = _typeConfig.GetValueOrDefault(key);
            if (partType == null)
            {
                _partsConfig[key] = null;
                return null;
            }

            var obj = Activator.CreateInstance(partType);
            if (obj is IComponentPart componentPart)
            {
                componentPart.Attach(component);
                _partsConfig[key] = componentPart;

                var builder = new AttributesBuilder();
                builderAction(builder);
                var parameters = ParameterView.FromDictionary(builder.Attributes);
                componentPart.SetParameters(parameters);

                return componentPart.Content;
            }

            throw new InvalidOperationException();
        }
    }
}
